const preloadedPublic = { done: false };
const preloadedUser = { done: false };
const preloadedAdmin = { done: false };

export const preloadPublicRoutes = () => {
  if (preloadedPublic.done) return;
  preloadedPublic.done = true;

  Promise.all([
    import("../pagesUser/HomePage.jsx"),
    import("../pagesUser/ShopPage.jsx"),
    import("../pagesUser/ProductDetailsPage.jsx"),
    import("../pagesUser/ContactUsPage.jsx"),
    import("../pagesUser/LoginPage.jsx"),
    import("../pagesUser/RegisterPage.jsx"),
    import("../pagesUser/CheckoutPage.jsx"),
    import("../pagesUser/ThankYouPage.jsx"),
    import("../pagesUser/BkashCallbackPage.jsx"),
    import("../pagesUser/AboutUsPageUser.jsx"),
    import("../pagesUser/TosPage.jsx"),
    import("../pagesUser/PrivacyPolicyPage.jsx"),
    import("../pagesUser/RefundPolicyPage.jsx"),
    import("../pagesUser/ShippingPolicyPage.jsx"),
    import("../pagesUser/FAQPage.jsx"),
    import("../pagesUser/TrackOrderPage.jsx"),
    import("../pagesUser/BlogsPage.jsx"),
    import("../pagesUser/BlogDetailsPage.jsx"),
    import("../pagesUser/ForgetPasswordPage.jsx"),
    import("../pagesUser/ResetPasswordPage.jsx"),
    import("../pagesUser/NotFoundPage.jsx"),
    import("../component/componentAdmin/AdminLogin.jsx"),
  ]).catch(() => {});
};

export const preloadUserRoutes = () => {
  if (preloadedUser.done) return;
  preloadedUser.done = true;

  Promise.all([
    import("../pagesUser/UserHomePage.jsx"),
    import("../pagesUser/UserAllOrdersPage.jsx"),
    import("../pagesUser/UserOrderDetailsPage.jsx"),
    import("../pagesUser/UpdateUserPage.jsx"),
    import("../pagesUser/ChangePasswordPage.jsx"),
    import("../pagesUser/WishlistPage.jsx"),
  ]).catch(() => {});
};

export const preloadAdminRoutes = () => {
  if (preloadedAdmin.done) return;
  preloadedAdmin.done = true;

  Promise.all([
    import("../pagesAdmin/GeneralInfoPage.jsx"),
    import("../pagesAdmin/SubscribedUsersPage.jsx"),
    import("../pagesAdmin/SliderBannerPage.jsx"),
    import("../pagesAdmin/ColorUpdaterPage.jsx"),
    import("../pagesAdmin/SocialLinkUpdaterPage.jsx"),
    import("../pagesAdmin/ContactRequestPage.jsx"),
    import("../pagesAdmin/ProductFlagPage.jsx"),
    import("../pagesAdmin/AddNewProductPage.jsx"),
    import("../pagesAdmin/ViewAllProductPage.jsx"),
    import("../pagesAdmin/EditProductPage.jsx"),
    import("../pagesAdmin/CustomerListPage.jsx"),
    import("../pagesAdmin/DeliveryChargePage.jsx"),
    import("../pagesAdmin/ConfigSetupPage.jsx"),
    import("../pagesAdmin/AllOrdersPage.jsx"),
    import("../pagesAdmin/PendingOrdersPage.jsx"),
    import("../pagesAdmin/ApprovedOrdersPage.jsx"),
    import("../pagesAdmin/InTransitOrdersPage.jsx"),
    import("../pagesAdmin/DeliveredOrdersPage.jsx"),
    import("../pagesAdmin/ReturnedOrdersPage.jsx"),
    import("../pagesAdmin/CancelledOrdersPage.jsx"),
    import("../pagesAdmin/ViewOrderPage.jsx"),
    import("../pagesAdmin/CouponPage.jsx"),
    import("../pagesAdmin/AboutUsPage.jsx"),
    import("../pagesAdmin/TermsPage.jsx"),
    import("../pagesAdmin/AdminFAQSPage.jsx"),
    import("../pagesAdmin/MarqueeAdminPage.jsx"),
    import("../pagesAdmin/AdminMetaPage.jsx"),
    import("../pagesAdmin/BKashConfigPage.jsx"),
    import("../pagesAdmin/SteadFastConfigPag.jsx"),
    import("../pagesAdmin/DashboardPage.jsx"),
    import("../pagesAdmin/AdminListPage.jsx"),
    import("../pagesAdmin/CreateAdminPage.jsx"),
    import("../pagesAdmin/EditAdminPage.jsx"),
    import("../pagesAdmin/AbandonedCartPage.jsx"),
    import("../pagesAdmin/CreateBlogPage.jsx"),
    import("../pagesAdmin/BlogsListPage.jsx"),
    import("../pagesAdmin/EditBlogPage.jsx"),
    import("../pagesAdmin/PathaoConfigPage.jsx"),
    import("../pagesAdmin/CategoryPage.jsx"),
    import("../pagesAdmin/SubCategoryPage.jsx"),
    import("../pagesAdmin/ChildCategoryPage.jsx"),
    import("../pagesAdmin/ProductOptionsPage.jsx"),
  ]).catch(() => {});
};
