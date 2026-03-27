import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // بنجيب المسار الحالي (pathname)
  const { pathname } = useLocation();

  useEffect(() => {
    // أول ما المسار يتغير، بنخلي السكرول يطلع لـ فوق خالص
    window.scrollTo(0, 0);
  }, [pathname]); // الـ Dependency هنا هي المسار

  return null; // الـ Component ده مش بيرندر حاجة، هو وظيفته Logic بس
};

export default ScrollToTop;