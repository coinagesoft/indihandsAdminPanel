"use client";

import Script from 'next/script';
import './globals.css';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { Toaster } from "react-hot-toast";
export default function RootLayout({ children }) {

  
  return (
    <html lang="en" suppressHydrationWarning>
     <head>
  {/* 1️⃣ Meta / Fonts */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />

  {/* 2️⃣ Icons */}
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/fonts/remixicon/remixicon.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/fonts/flag-icons.css"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  />

  {/* 3️⃣ Core Vendor CSS (FOUNDATION) */}
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/node-waves/node-waves.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/typeahead-js/typeahead.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/@form-validation/form-validation.css"
  />

  {/* 4️⃣ Core Template CSS (MUST come before page CSS) */}
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/rtl/core.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/rtl/theme-default.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/css/demo.css"
  />

  {/* 5️⃣ Vendor Components */}
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/swiper/swiper.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/libs/apex-charts/apex-charts.css"
  />

  {/* 6️⃣ Page-level CSS (LOAD LAST) */}
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/pages/cards-statistics.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/pages/app-calendar.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/pages/page-auth.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/pages/page-profile.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/pages/page-faq.css"
  />
  <link
    rel="stylesheet"
    href="/materialize/assets/vendor/css/pages/page-pricing.css"
  />
</head>

      <body >


      
              <div className="">{children}</div>
     
    <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#fff",
              color: "#333",
              border: "1px solid #eee",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#ff7a00",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc3545",
                secondary: "#fff",
              },
            },
          }}
        />


    {/* 1️⃣ Core helpers (MUST be first) */}

    <Script id="materialize-global-fix" strategy="beforeInteractive">
  {`
    window.templateCustomizer = window.templateCustomizer || {};
    window.templateCustomizer.settings = window.templateCustomizer.settings || {};
    window.Helpers = window.Helpers || {};
    window.Helpers.settings = window.Helpers.settings || {};
  `}
</Script>

<Script src="/materialize/assets/vendor/js/helpers.js" strategy="beforeInteractive" />
<Script src="/materialize/assets/vendor/js/template-customizer.js" strategy="beforeInteractive" />
<Script src="/materialize/assets/js/config.js" strategy="beforeInteractive" />

<Script
  src="/materialize/assets/vendor/js/helpers.js"
  strategy="beforeInteractive"
/>
<Script
  src="/materialize/assets/vendor/js/template-customizer.js"
  strategy="beforeInteractive"
/>
<Script
  src="/materialize/assets/js/config.js"
  strategy="beforeInteractive"
/>

{/* 2️⃣ jQuery (MUST load before bootstrap & plugins) */}
<Script
  src="/materialize/assets/vendor/libs/jquery/jquery.js"
  strategy="beforeInteractive"
/>

{/* 3️⃣ Core JS */}
<Script
  src="/materialize/assets/vendor/libs/popper/popper.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/vendor/js/bootstrap.js"
  strategy="afterInteractive"
/>

{/* 4️⃣ UI & Scroll dependencies (Fix sidebar scrolling) */}
<Script
  src="/materialize/assets/vendor/libs/node-waves/node-waves.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/vendor/libs/hammer/hammer.js"
  strategy="afterInteractive"
/>

{/* 5️⃣ Optional vendor utilities */}
<Script
  src="/materialize/assets/vendor/libs/i18n/i18n.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/vendor/libs/typeahead-js/typeahead.js"
  strategy="afterInteractive"
/>

{/* 6️⃣ Menu (REQUIRED for fixed sidebar) */}
<Script
  src="/materialize/assets/vendor/js/menu.js"
  strategy="afterInteractive"
/>

{/* 7️⃣ Form validation */}
<Script
  src="/materialize/assets/vendor/libs/@form-validation/popular.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/vendor/libs/@form-validation/bootstrap5.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/vendor/libs/@form-validation/auto-focus.js"
  strategy="afterInteractive"
/>

{/* 8️⃣ Template core logic */}
<Script
  src="/materialize/assets/js/main.js"
  strategy="afterInteractive"
/>

{/* 9️⃣ Page-level scripts (ONLY if page exists) */}
<Script
  src="/materialize/assets/js/pages-profile-user.js"
  strategy="afterInteractive"
/>
<Script
  src="/materialize/assets/js/pages-pricing.js"
  strategy="afterInteractive"
/>

{/* 🔟 Charts (ApexCharts MUST load BEFORE dashboard JS) */}
<Script
  src="/materialize/assets/vendor/libs/apex-charts/apexcharts.js"
  strategy="afterInteractive"
/>

<Script
  src="/materialize/assets/js/app-ecommerce-dashboard.js"
  strategy="afterInteractive"
/>

{/* 1️⃣1️⃣ Swiper (sliders/cards) */}
<Script
  src="/materialize/assets/vendor/libs/swiper/swiper.js"
  strategy="afterInteractive"
/>

      </body>
    </html>
  );
}
