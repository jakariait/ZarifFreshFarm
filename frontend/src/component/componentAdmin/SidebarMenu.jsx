import {
  FaHome,
  FaCog,
  FaThLarge,
  FaBoxes,
  FaList,
  FaTags,
  FaCreditCard,
  FaUsers,
  FaEnvelope,
  FaUserFriends,
  FaSlidersH,
  FaFileAlt,
  FaQuestionCircle,
  FaUserShield,
  FaSignOutAlt,
  FaShoppingBag,
  FaInfo,
  FaClipboardList,
  FaBlog,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../store/useProductStore.js";
import useOrderStore from "../../store/useOrderStore.js";
import React, { useEffect, useState, useCallback } from "react";
import RequirePermission from "./RequirePermission.jsx";
import { ChevronDown } from "lucide-react";

export const MENU_CONFIG = [
  {
    section: "dashboard",
    items: [
      {
        type: "link",
        label: "Dashboard",
        icon: FaHome,
        path: "/admin/dashboard",
        permission: "dashboard",
      },
    ],
  },
  {
    section: "websiteConfig",
    label: "Website Config",
    icon: FaThLarge,
    permission: ["website_theme_color", "general_info", "home_page_seo"],
    match: "any",
    items: [
      {
        type: "link",
        label: "General Info",
        path: "/admin/general-info",
        permission: "general_info",
      },
      {
        type: "link",
        label: "Website Theme Color",
        path: "/admin/color-updater/",
        permission: "website_theme_color",
      },
      {
        type: "link",
        label: "Social Media Links",
        path: "/admin/social-link-updater",
        permission: "website_theme_color",
      },
      {
        type: "link",
        label: "Home Page SEO",
        path: "/admin/homepage-seo",
        permission: "home_page_seo",
      },
    ],
  },
  {
    section: "config",
    label: "Config",
    icon: FaCog,
    permission: [
      "setup_config",
      "product_size",
      "product_flag",
      "scroll_text",
      "delivery_charges",
      "manage_coupons",
    ],
    match: "any",
    items: [
      {
        type: "link",
        label: "Setup Your Config",
        path: "/admin/configsetup",
        permission: "setup_config",
      },
      {
        type: "link",
        label: "Product Options",
        path: "/admin/product-options",
        permission: "product_size",
      },
      {
        type: "link",
        label: "Product Flags",
        path: "/admin/product-flags",
        permission: "product_flag",
      },
      {
        type: "link",
        label: "Scroll Text",
        path: "/admin/scroll-text",
        permission: "scroll_text",
      },
      {
        type: "link",
        label: "Delivery Charges",
        path: "/admin/deliverycharge",
        permission: "delivery_charges",
      },
      {
        type: "link",
        label: "Coupon",
        path: "/admin/coupon",
        permission: "manage_coupons",
      },
    ],
  },
  {
    section: "category",
    items: [
      {
        type: "link",
        label: "Category",
        icon: FaThLarge,
        path: "/admin/category",
        permission: "category",
      },
    ],
  },
  {
    section: "subcategory",
    items: [
      {
        type: "link",
        label: "Subcategory",
        icon: FaBoxes,
        path: "/admin/subcategory",
        permission: "sub_category",
      },
    ],
  },
  {
    section: "childcategory",
    items: [
      {
        type: "link",
        label: "Child Category",
        icon: FaList,
        path: "/admin/childcategory",
        permission: "child_category",
      },
    ],
  },
  {
    section: "products",
    label: "Manage Products",
    icon: FaTags,
    permission: [
      "add_products",
      "delete_products",
      "view_products",
      "edit_products",
    ],
    match: "any",
    items: [
      {
        type: "link",
        label: "Add New Product",
        path: "/admin/addnewproduct",
        permission: "add_products",
      },
      {
        type: "link",
        label: "View All Products",
        path: "/admin/viewallproducts",
        permission: "view_products",
        showCount: "totalProductsAdmin",
      },
    ],
  },
  {
    section: "orders",
    label: "Manage Orders",
    icon: FaShoppingBag,
    permission: "view_orders",
    items: [
      {
        type: "link",
        label: "All Orders",
        path: "/admin/allorders",
        permission: "view_orders",
        showCount: "totalOrders",
      },
      {
        type: "link",
        label: "Pending Orders",
        path: "/admin/pendingorders",
        permission: "view_orders",
        countKey: "pendingCount",
      },
      {
        type: "link",
        label: "Approved Orders",
        path: "/admin/approvedorders",
        permission: "view_orders",
        countKey: "approvedCount",
      },
      {
        type: "link",
        label: "In Transit Orders",
        path: "/admin/intransitorders",
        permission: "view_orders",
        countKey: "intransitCount",
      },
      {
        type: "link",
        label: "Delivered Orders",
        path: "/admin/deliveredorders",
        permission: "view_orders",
        countKey: "deliveredCount",
      },
      {
        type: "link",
        label: "Returned Orders",
        path: "/admin/returnedorders",
        permission: "view_orders",
        countKey: "returnedCount",
      },
      {
        type: "link",
        label: "Cancelled Orders",
        path: "/admin/cancelledorders",
        permission: "view_orders",
        countKey: "cancelledCount",
      },
    ],
  },
  {
    section: "incompleteOrders",
    items: [
      {
        type: "link",
        label: "Incomplete Order",
        icon: FaClipboardList,
        path: "/admin/incomplete-order",
        permission: "incomplete_orders",
      },
    ],
  },
  {
    section: "gateway",
    label: "Gateway & API",
    icon: FaCreditCard,
    permission: ["bkash_api", "steadfast_api", "pathao_api"],
    match: "any",
    items: [
      {
        type: "link",
        label: "bKash",
        path: "/admin/bkash-config",
        permission: "bkash_api",
      },
      {
        type: "link",
        label: "Steadfast",
        path: "/admin/steadfast-config",
        permission: "steadfast_api",
      },
      {
        type: "link",
        label: "Pathao",
        path: "/admin/pathao-config",
        permission: "pathao_api",
      },
    ],
  },
  {
    section: "customers",
    items: [
      {
        type: "link",
        label: "Customers",
        icon: FaUsers,
        path: "/admin/customers",
        permission: "view_customers",
      },
    ],
  },
  {
    section: "other",
    items: [
      {
        type: "link",
        label: "Contact Request",
        icon: FaEnvelope,
        path: "/admin/contact-request",
        permission: "contact_request",
      },
      {
        type: "link",
        label: "Subscribed Users",
        icon: FaUserFriends,
        path: "/admin/subscribed-users",
        permission: "subscribed_users",
      },
      {
        type: "link",
        label: "Blogs",
        icon: FaBlog,
        path: "/admin/blogs",
        permission: "blogs",
      },
    ],
  },
  {
    section: "content",
    items: [
      {
        type: "link",
        label: "Sliders & Banners",
        icon: FaSlidersH,
        path: "/admin/sliders-banners",
        permission: "sliders-banners",
      },
      {
        type: "link",
        label: "Terms & Policies",
        icon: FaFileAlt,
        path: "/admin/terms-policies",
        permission: "about_terms-policies",
      },
      {
        type: "link",
        label: "FAQs",
        icon: FaQuestionCircle,
        path: "/admin/faqs",
        permission: "faqs",
      },
      {
        type: "link",
        label: "About Us",
        icon: FaInfo,
        path: "/admin/about-us",
        permission: "about_terms-policies",
      },
    ],
  },
  {
    section: "system",
    items: [
      {
        type: "link",
        label: "System Users",
        icon: FaUserShield,
        path: "/admin/adminlist",
        permission: "admin-users",
      },
    ],
  },
];

function MenuItem({ item, countValue }) {
  const Icon = item.icon;
  const count = item.countKey
    ? countValue[item.countKey]
    : countValue?.[item.showCount];

  return (
    <li>
      <Link
        to={item.path}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
      >
        {Icon && <Icon />}
        <span>{item.label}</span>
        {count !== undefined && (
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}

function MenuAccordion({ item, countValue, expanded, onChange }) {
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={onChange}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors text-left"
      >
        {Icon && <Icon />}
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="space-y-2 pl-4 pt-1">
          {item.items.map((subItem, idx) => (
            <MenuItem key={idx} item={subItem} countValue={countValue} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SidebarMenu() {
  const { totalProductsAdmin } = useProductStore();
  const { logout } = useAuthAdminStore();
  const { totalByStatus, fetchAllStatusCounts } = useOrderStore();
  const { loading } = useAuthAdminStore();

  useEffect(() => {
    fetchAllStatusCounts();
  }, [fetchAllStatusCounts]);

  const pendingCount = totalByStatus.pending;
  const approvedCount = totalByStatus.approved;
  const intransitCount = totalByStatus.intransit;
  const deliveredCount = totalByStatus.delivered;
  const returnedCount = totalByStatus.returned;
  const cancelledCount = totalByStatus.cancelled;

  const totalOrders = Object.values(totalByStatus).reduce(
    (acc, count) => acc + count,
    0,
  );

  const countValues = {
    totalProductsAdmin,
    totalOrders,
    pendingCount,
    approvedCount,
    intransitCount,
    deliveredCount,
    returnedCount,
    cancelledCount,
  };

  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved ? JSON.parse(saved) : [];
  });

  const handleAccordionChange = useCallback((label) => () => {
    setExpandedSections((prev) => {
      const isExpanded = prev.includes(label);
      const next = isExpanded
        ? prev.filter((l) => l !== label)
        : [...prev, label];
      localStorage.setItem("sidebar-expanded", JSON.stringify(next));
      return next;
    });
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="p-4">
      <ul>
        {MENU_CONFIG.map((section, sectionIdx) => {
          const singleItem = section.items?.length === 1 && !section.label;

          if (section.items.length === 0) return null;

          if (singleItem) {
            const item = section.items[0];
            const Icon = item.icon;
            return (
              <RequirePermission
                key={sectionIdx}
                permission={item.permission}
                fallback={true}
              >
                <li>
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                  >
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              </RequirePermission>
            );
          }

          if (section.label) {
            return (
              <RequirePermission
                key={sectionIdx}
                permission={section.permission}
                match={section.match}
                fallback={true}
              >
                <li>
                  <MenuAccordion
                    item={section}
                    countValue={countValues}
                    expanded={expandedSections.includes(section.label)}
                    onChange={handleAccordionChange(section.label)}
                  />
                </li>
              </RequirePermission>
            );
          }

          return (
            <React.Fragment key={sectionIdx}>
              {section.items.map((item, itemIdx) => (
                <RequirePermission
                  key={`${sectionIdx}-${itemIdx}`}
                  permission={item.permission}
                  fallback={true}
                >
                  <li>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                      {item.showCount &&
                        countValues[item.showCount] !== undefined && (
                          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {countValues[item.showCount]}
                          </span>
                        )}
                    </Link>
                  </li>
                </RequirePermission>
              ))}
            </React.Fragment>
          );
        })}
      </ul>

      <li>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-red-500 hover:bg-white/5 transition-colors mt-4"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </li>
    </div>
  );
}
