"""
Sky Online — Security & Load Test Suite
รัน: python3 security_test.py
ต้องติดตั้ง: pip install aiohttp requests colorama
"""

import asyncio
import time
import json
import statistics
import requests
import aiohttp
from colorama import Fore, Style, init

init(autoreset=True)

BASE = "http://localhost:5001/api"

# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

def header(title):
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  {title}")
    print(f"{'═'*60}{Style.RESET_ALL}")

def ok(msg):    print(f"  {Fore.GREEN}✓ {msg}{Style.RESET_ALL}")
def fail(msg):  print(f"  {Fore.RED}✗ {msg}{Style.RESET_ALL}")
def warn(msg):  print(f"  {Fore.YELLOW}⚠ {msg}{Style.RESET_ALL}")
def info(msg):  print(f"  {Fore.WHITE}· {msg}{Style.RESET_ALL}")

results = {"passed": 0, "failed": 0, "warnings": 0}

def check(condition, pass_msg, fail_msg, warning=False):
    if condition:
        ok(pass_msg)
        results["passed"] += 1
    elif warning:
        warn(fail_msg)
        results["warnings"] += 1
    else:
        fail(fail_msg)
        results["failed"] += 1

# ─────────────────────────────────────────
# 1. LOAD TEST  (asyncio + aiohttp)
# ─────────────────────────────────────────

async def single_request(session, url, latencies):
    t0 = time.perf_counter()
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as r:
            await r.read()
            latencies.append((time.perf_counter() - t0) * 1000)
            return r.status
    except Exception:
        latencies.append(10000)
        return 0

async def run_load_test(endpoint, concurrent, total):
    url = f"{BASE}{endpoint}"
    latencies = []
    errors = 0
    statuses = {}

    connector = aiohttp.TCPConnector(limit=concurrent)
    async with aiohttp.ClientSession(connector=connector) as session:
        t_start = time.perf_counter()
        tasks = [single_request(session, url, latencies) for _ in range(total)]
        raw = await asyncio.gather(*tasks)
        elapsed = time.perf_counter() - t_start

    for s in raw:
        statuses[s] = statuses.get(s, 0) + 1
        if s == 0 or s >= 500:
            errors += 1

    success = total - errors
    rps = total / elapsed if elapsed > 0 else 0
    valid = [l for l in latencies if l < 9999]

    info(f"Endpoint   : {endpoint}")
    info(f"Concurrent : {concurrent}  |  Total: {total}")
    info(f"Duration   : {elapsed:.2f}s  |  RPS: {rps:.1f}")
    info(f"Status     : {statuses}")

    if valid:
        info(f"Latency    : avg={statistics.mean(valid):.0f}ms  "
             f"p50={statistics.median(valid):.0f}ms  "
             f"max={max(valid):.0f}ms")

    check(errors == 0,
          f"0 errors ({success}/{total} success)",
          f"{errors} errors (server ไม่รองรับ load นี้)")
    check(rps > 50,
          f"Throughput ดี ({rps:.1f} req/s)",
          f"Throughput ต่ำ ({rps:.1f} req/s) — ควร > 50",
          warning=True)
    if valid:
        avg = statistics.mean(valid)
        check(avg < 500,
              f"Avg latency ปกติ ({avg:.0f}ms)",
              f"Avg latency สูง ({avg:.0f}ms) — ควร < 500ms",
              warning=avg < 2000)

def test_load():
    header("1. LOAD TEST")

    scenarios = [
        ("/products",   10, 100, "Light load  — products"),
        ("/products",   50, 500, "Medium load — products"),
        ("/health",    100, 1000,"Heavy load  — health"),
        ("/activities",  30, 300, "Light load  — activities"),
    ]

    for endpoint, conc, total, label in scenarios:
        print(f"\n  [{label}]")
        asyncio.run(run_load_test(endpoint, conc, total))

# ─────────────────────────────────────────
# 2. SECURITY HEADERS
# ─────────────────────────────────────────

def test_security_headers():
    header("2. SECURITY HEADERS")

    r = requests.get(f"{BASE}/health", timeout=5)
    h = r.headers

    check("x-content-type-options" in [k.lower() for k in h],
          "X-Content-Type-Options มี",
          "X-Content-Type-Options ไม่มี — ควรเพิ่ม nosniff", warning=True)

    check("x-frame-options" in [k.lower() for k in h],
          "X-Frame-Options มี",
          "X-Frame-Options ไม่มี — เสี่ยง Clickjacking", warning=True)

    check("strict-transport-security" in [k.lower() for k in h],
          "HSTS มี",
          "HSTS ไม่มี (ปกติสำหรับ HTTP dev)", warning=True)

    cors = h.get("Access-Control-Allow-Origin", "")
    check(cors != "*",
          f"CORS ไม่เปิดกว้าง (ค่า: '{cors}')",
          "CORS เปิด * — production ควร restrict origin")

    sv = h.get("Server", h.get("X-Powered-By", ""))
    check(sv == "",
          "ไม่เปิดเผย Server/framework version",
          f"เปิดเผย server info: '{sv}' — ควรซ่อน", warning=True)

    info(f"Headers ที่ได้รับ: {dict(h)}")

# ─────────────────────────────────────────
# 3. SQL INJECTION
# ─────────────────────────────────────────

def test_sql_injection():
    header("3. SQL INJECTION")

    payloads = [
        "' OR '1'='1",
        "'; DROP TABLE products;--",
        "1' UNION SELECT * FROM members--",
        "' OR 1=1--",
        "admin'--",
    ]

    # Test login endpoint
    for p in payloads:
        r = requests.post(f"{BASE}/members/login",
                          json={"email": p, "password": p}, timeout=5)
        check(r.status_code in (400, 401, 422),
              f"Login บล็อก payload: {p[:30]}",
              f"Login ตอบ {r.status_code} กับ payload: {p[:30]}")

    # Test products query string
    for p in payloads:
        r = requests.get(f"{BASE}/products",
                         params={"category": p}, timeout=5)
        check(r.status_code < 500,
              f"Products ไม่ crash กับ: {p[:30]}",
              f"Products crash (500) กับ: {p[:30]}")

    # Test register
    r = requests.post(f"{BASE}/members/register",
                      json={"first_name": "' OR '1'='1", "last_name": "test",
                            "email": "sqli@test.com", "phone": "0800000000",
                            "password": "123456"},
                      timeout=5)
    check(r.status_code in (201, 400, 409),
          f"Register รับ payload แต่จัดการได้ (status: {r.status_code})",
          f"Register ตอบผิดปกติ (status: {r.status_code})")

# ─────────────────────────────────────────
# 4. AUTHENTICATION
# ─────────────────────────────────────────

def test_authentication():
    header("4. AUTHENTICATION & INPUT VALIDATION")

    # Missing fields
    r = requests.post(f"{BASE}/members/login", json={}, timeout=5)
    check(r.status_code == 400,
          "Login ปฏิเสธ request ว่าง (400)",
          f"Login ยอมรับ request ว่าง (status: {r.status_code})")

    # Wrong password
    r = requests.post(f"{BASE}/members/login",
                      json={"email": "notexist@test.com", "password": "wrong"},
                      timeout=5)
    check(r.status_code == 401,
          "Login ปฏิเสธ credential ผิด (401)",
          f"Login ตอบ {r.status_code} (ควร 401)")

    # ตรวจว่า error message ไม่บอกว่า "email ไม่มีในระบบ" (เพื่อกัน user enumeration)
    msg = r.json().get("error", "")
    check("ไม่ถูกต้อง" in msg or "incorrect" in msg.lower(),
          "Error message ไม่ระบุว่า email หรือ password ผิด (กัน enumeration)",
          f"Error message บอกรายละเอียดมากเกินไป: '{msg}'", warning=True)

    # Password too short
    r = requests.post(f"{BASE}/members/register",
                      json={"first_name": "Test", "last_name": "User",
                            "email": "test_short@test.com", "phone": "0800000000",
                            "password": "123"},
                      timeout=5)
    check(r.status_code == 400,
          "Register ปฏิเสธ password สั้น < 6 ตัว (400)",
          f"Register ยอมรับ password สั้น (status: {r.status_code})")

    # Empty name
    r = requests.post(f"{BASE}/members/register",
                      json={"first_name": "", "last_name": "",
                            "email": "empty@test.com", "phone": "0800000000",
                            "password": "123456"},
                      timeout=5)
    check(r.status_code == 400,
          "Register ปฏิเสธชื่อว่าง (400)",
          f"Register ยอมรับชื่อว่าง (status: {r.status_code})")

# ─────────────────────────────────────────
# 5. OVERSIZED INPUT (DoS via large payload)
# ─────────────────────────────────────────

def test_oversized_input():
    header("5. OVERSIZED INPUT (Large Payload)")

    big = "A" * 100_000  # 100KB string

    r = requests.post(f"{BASE}/members/login",
                      json={"email": big, "password": big},
                      timeout=10)
    check(r.status_code in (400, 401, 413),
          f"Login รับ payload 100KB ได้โดยไม่ crash (status: {r.status_code})",
          f"Login crash กับ payload ใหญ่ (status: {r.status_code})")

    r = requests.post(f"{BASE}/contact",
                      json={"name": big, "email": "x@x.com",
                            "phone": "0800000000", "message": big},
                      timeout=10)
    check(r.status_code in (201, 400, 413),
          f"Contact รับ payload 100KB ได้ (status: {r.status_code})",
          f"Contact crash กับ payload ใหญ่ (status: {r.status_code})")

# ─────────────────────────────────────────
# 6. RATE LIMITING
# ─────────────────────────────────────────

def test_rate_limiting():
    header("6. RATE LIMITING")

    # ยิง login 30 ครั้งเร็วๆ
    blocked = 0
    for i in range(30):
        r = requests.post(f"{BASE}/members/login",
                          json={"email": f"bruteforce{i}@test.com",
                                "password": "wrongpass"},
                          timeout=5)
        if r.status_code == 429:
            blocked += 1

    check(blocked > 0,
          f"Rate limiting ทำงาน — blocked {blocked}/30 requests (429)",
          "ไม่มี Rate limiting — brute force 30 requests ผ่านหมด", warning=True)

# ─────────────────────────────────────────
# 7. IDOR (Insecure Direct Object Reference)
# ─────────────────────────────────────────

def test_idor():
    header("7. IDOR — Order/Member Data Access")

    # เข้าถึง order ของสมาชิกอื่นโดยไม่มี token
    r = requests.get(f"{BASE}/orders/member/BL2600001", timeout=5)
    check(r.status_code in (401, 403, 404),
          f"Order history ต้องการ auth (status: {r.status_code})",
          f"Order history เปิดให้เข้าถึงโดยไม่ต้อง auth (status: {r.status_code})",
          warning=True)

    # ดึง member list ทั้งหมด — ไม่ควรเปิดโดยไม่มี auth
    r = requests.get(f"{BASE}/members", timeout=5)
    check(r.status_code in (401, 403, 404),
          f"Member list ต้องการ auth (status: {r.status_code})",
          f"Member list เปิดให้ดูได้โดยไม่มี auth (status: {r.status_code})",
          warning=True)

# ─────────────────────────────────────────
# 8. XSS via stored input
# ─────────────────────────────────────────

def test_xss():
    header("8. XSS — Stored Input Check")

    xss_payloads = [
        "<script>alert(1)</script>",
        '"><img src=x onerror=alert(1)>',
        "javascript:alert(1)",
    ]

    for p in xss_payloads:
        r = requests.post(f"{BASE}/contact",
                          json={"name": p, "email": "xss@test.com",
                                "phone": "0800000000", "message": p},
                          timeout=5)
        # ถ้า backend คืน payload กลับมาใน response ให้ตรวจสอบ
        body = r.text
        escaped = "<script>" not in body and "onerror=" not in body
        check(escaped or r.status_code in (400, 422),
              f"XSS payload ไม่ถูก reflect กลับ: {p[:30]}",
              f"XSS payload อาจถูก reflect กลับ: {p[:30]}", warning=True)

# ─────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────

def summary():
    print(f"\n{Fore.CYAN}{'═'*60}")
    print(f"  สรุปผลการทดสอบ")
    print(f"{'═'*60}{Style.RESET_ALL}")
    total = results["passed"] + results["failed"] + results["warnings"]
    print(f"  {Fore.GREEN}✓ ผ่าน    : {results['passed']}{Style.RESET_ALL}")
    print(f"  {Fore.RED}✗ ไม่ผ่าน : {results['failed']}{Style.RESET_ALL}")
    print(f"  {Fore.YELLOW}⚠ เตือน   : {results['warnings']}{Style.RESET_ALL}")
    print(f"  {'─'*30}")
    print(f"  รวม      : {total} checks")

    if results["failed"] == 0 and results["warnings"] == 0:
        print(f"\n  {Fore.GREEN}🎉 ทุก check ผ่าน!{Style.RESET_ALL}")
    elif results["failed"] == 0:
        print(f"\n  {Fore.YELLOW}⚠ มีข้อควรปรับปรุง {results['warnings']} จุด{Style.RESET_ALL}")
    else:
        print(f"\n  {Fore.RED}❌ พบปัญหาด้านความปลอดภัย {results['failed']} จุด — ควรแก้ไขก่อน production{Style.RESET_ALL}")
    print()

# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────

if __name__ == "__main__":
    print(f"{Fore.CYAN}Sky Online — Security & Load Test Suite{Style.RESET_ALL}")
    print(f"Target: {BASE}\n")

    # ตรวจว่า backend ทำงานอยู่
    try:
        requests.get(f"{BASE}/health", timeout=3)
    except Exception:
        print(f"{Fore.RED}✗ Backend ไม่ตอบสนองที่ {BASE}{Style.RESET_ALL}")
        print("  รัน: cd backend && npm run dev")
        exit(1)

    test_load()
    test_security_headers()
    test_sql_injection()
    test_authentication()
    test_oversized_input()
    test_rate_limiting()
    test_idor()
    test_xss()
    summary()
