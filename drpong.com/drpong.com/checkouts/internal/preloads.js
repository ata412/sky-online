
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.iRHCMwIP.js","/cdn/shopifycloud/checkout-web/assets/c1/app.CZe4_9gV.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.BM02uDoz.js","/cdn/shopifycloud/checkout-web/assets/c1/context-browser.BpMERJKA.js","/cdn/shopifycloud/checkout-web/assets/c1/types-UnauthenticatedErrorModalPayload.BAfH4iXc.js","/cdn/shopifycloud/checkout-web/assets/c1/proposal-delegated-payment-instrument.Cw2-r3Os.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-discount-offer.BY8N4sib.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-shopId.BVFSa5Eq.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-PaymentSessionMutation.obFn0c4T.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-ShopPayCheckoutSessionQuery.CL8wV7Lu.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-UserPrivacySettingsSetMutation.tm4Lmhr5.js","/cdn/shopifycloud/checkout-web/assets/c1/extensions-rpc.BO1Y4Ks6.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-getCommonShopPayExternalTelemetryAttributes.CGMJzA-U.js","/cdn/shopifycloud/checkout-web/assets/c1/hydrate.DTH4K6uP.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-th.BagAhRHd.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage.DFSFiHM-.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.BD4ac3yW.js","/cdn/shopifycloud/checkout-web/assets/c1/remember-me-hooks.DHy76utI.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUnauthenticatedErrorModal.ChfiDZog.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useStableHostMethodsReferences.DmRMjNmR.js","/cdn/shopifycloud/checkout-web/assets/c1/OffsitePaymentFailed.Bb5rVBIl.js","/cdn/shopifycloud/checkout-web/assets/c1/SplitDeliveryMerchandiseContainer.CQduvdbx.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.DeveRHMx.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletsSandbox-WalletSandbox.cvNbviXo.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressForm.CrpuRKYz.js","/cdn/shopifycloud/checkout-web/assets/c1/PhoneField.GO1e13Gy.js","/cdn/shopifycloud/checkout-web/assets/c1/images-flag-icon.C_eXYJRt.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodRateLabel.NaQD6wud.js","/cdn/shopifycloud/checkout-web/assets/c1/CompactChoiceList.CPBcdBrf.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useSuppressShopPayModalOnLoad.BWxdVnZi.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePostPurchase.D4KpCp3d.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayCheckoutGqlVersion.DE1YGKjX.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.CJT4ZcOR.js","/cdn/shopifycloud/checkout-web/assets/c1/CaptureEvents-ButtonWithRegisterWebPixel.Dnyfawxd.js","/cdn/shopifycloud/checkout-web/assets/c1/GooglePayButton-index.CnJe260j.js","/cdn/shopifycloud/checkout-web/assets/c1/PendingShipping.B_av86Ei.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.D93LbU5r.js","/cdn/shopifycloud/checkout-web/assets/c1/LocalizationExtensionField.CykMpIKA.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayPaymentRequiredMethod.DPK9MQdK.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUpdateCheckoutAddress.CF-XNU8g.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage.CNx-T_P-.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentLine.C8kHb3z7.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentIcon.CrdxbgTB.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.DPmipj_Q.js","/cdn/shopifycloud/checkout-web/assets/c1/billing-address-hooks.DGU580mV.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletLogo.Dzjq7hn1.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShowShopPayOptin.B34rat0F.js","/cdn/shopifycloud/checkout-web/assets/c1/Section.DFijKw5I.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary.Bs12oDkP.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useOnePageFormSubmit.8JubnnNi.js","/cdn/shopifycloud/checkout-web/assets/c1/PayPalOverCaptureInfoBanner.DDEX1Za8.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-get-negotiation-input.G2TrTwlX.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopCashCheckoutEligibility.BSVQZBGn.js","/cdn/shopifycloud/checkout-web/assets/c1/redemption-constants.Cu2A-vp8.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressSelector.14t5m1wT.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentErrorBanner.BCyibaCm.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.CEHd8Zjt.js","/cdn/shopifycloud/checkout-web/assets/c1/DutyOptions.XjGJ_Jem.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.L3ERBPin.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal.aQuMPwi4.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.DlSg164h.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.CaMO1rg9.js","/cdn/shopifycloud/checkout-web/assets/c1/EstimatedDeliveryContent.C_YNqRAV.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodSelector.BVsRl2qp.js","/cdn/shopifycloud/checkout-web/assets/c1/TextArea.BQZpHvJy.js","/cdn/shopifycloud/checkout-web/assets/c1/SubscriptionPriceBreakdown.DZkq4z1p.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePaypalRowEffects.DFNMILI1.js","/cdn/shopifycloud/checkout-web/assets/c1/Switch.BTTZh1_-.js","/cdn/shopifycloud/checkout-web/assets/c1/Middot.Jsi1WL6C.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine.BlDZVXib.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-publishMessage.D6iN-mxe.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.CMvjny27.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/UnauthenticatedErrorModalPayload.PQOzdEj1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NotFound.DxsSa3YQ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.CQM_ODoE.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SplitDeliveryMerchandiseContainer.D_EbuoqI.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/LocalizationExtensionField.DugS7mXw.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.CqVkJv9Z.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useOnePageFormSubmit.CtCAWdWo.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/WalletLogo.CIy8uDiZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useSuppressShopPayModalOnLoad.D-V2RVyM.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ChangeCompanyLocationLink.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/CompactChoiceList.BEvzDDvy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Section.CU18S7Ap.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentLine.7870thps.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentIcon.CLVwzp6i.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DutyOptions.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Switch.Dq_6Ius6.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm.Dj0n4Opx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField.DN6CUyst.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Middot.D7Ujmshx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent.Dl_bEC_c.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PayPalOverCaptureInfoBanner.CuS5ve3d.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/usePostPurchase.uv-X4L1-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/WalletSandbox.CnR7qNLY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector.B0hio2RO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown.vTcdVGq4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0738/7902/7847/files/c89a96afa5815bfe4cb034ee2859eb76_ed9b0269-ec80-4a6e-9284-36bda5c4e359_x320.png?v=1782658785"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  