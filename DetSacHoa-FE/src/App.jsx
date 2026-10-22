import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './index.css';
import Login from './pages/Login';
import Products from './pages/Products';
import Collections from './pages/Collections';
import AdminLayout from './pages/admin/AdminLayout';
import AIFlowerStudio from './pages/customer/AIFlowerStudio';
import About from './pages/About';
import { getStoredAuth } from './services/adminService';

export default function App() {
    const bgAudioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(() => typeof window !== 'undefined' && window.location.pathname.includes('/products'));
    const [isCollectionsOpen, setIsCollectionsOpen] = useState(() => typeof window !== 'undefined' && window.location.pathname.includes('/collections'));
    const [isAdminOpen, setIsAdminOpen] = useState(() => typeof window !== 'undefined' && window.location.pathname.includes('/admin'));
    const [isAIOpen, setIsAIOpen] = useState(() => typeof window !== 'undefined' && (window.location.pathname.includes('ai-flower-studio') || window.location.hash.includes('ai-flower-studio')));
    const [isAboutOpen, setIsAboutOpen] = useState(() => typeof window !== 'undefined' && window.location.pathname.includes('/about'));
    const [transitionState, setTransitionState] = useState('idle');

    // Xác định có đang ở trang Home hay không
    const isHomePage = !isProductsOpen && !isCollectionsOpen && !isAdminOpen && !isAIOpen && !isAboutOpen && !isLoginOpen;

    // Quản lý class body và điều khiển nhạc theo trang
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isHomePage) {
                document.body.classList.add('is-home-page');
                document.body.classList.remove('not-home');
            } else {
                document.body.classList.add('not-home');
                document.body.classList.remove('is-home-page');
            }
        }

        // Nhạc chỉ phát ra ở trang home, chuyển trang khác tắt ngay lập tức
        if (bgAudioRef.current) {
            if (isHomePage && !isMuted) {
                bgAudioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
            } else {
                bgAudioRef.current.pause();
                bgAudioRef.current.currentTime = 0;
            }
        }
    }, [isHomePage, isMuted]);

    // Đồng bộ trạng thái URL khi người dùng bấm nút Back/Forward của trình duyệt
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const hash = window.location.hash;
            setIsProductsOpen(path.includes('/products'));
            setIsCollectionsOpen(path.includes('/collections'));
            setIsAdminOpen(path.includes('/admin'));
            setIsAIOpen(path.includes('ai-flower-studio') || hash.includes('ai-flower-studio'));
            setIsAboutOpen(path.includes('/about'));
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavigate = (target) => {
        if (target === 'products' && isProductsOpen) return;
        if (target === 'collections' && isCollectionsOpen) return;
        if (target === 'admin' && isAdminOpen) return;
        if (target === 'ai-studio' && isAIOpen) return;
        if (target === 'about' && isAboutOpen) return;
        if (target === 'home' && (!isProductsOpen && !isCollectionsOpen && !isAdminOpen && !isAIOpen && !isAboutOpen)) return;

        // Khi bắt đầu chuyển sang trang khác, lập tức tắt nhạc
        if (target !== 'home' && bgAudioRef.current) {
            bgAudioRef.current.pause();
            bgAudioRef.current.currentTime = 0;
        }

        setTransitionState('in');
        setTimeout(() => {
            setIsProductsOpen(false);
            setIsCollectionsOpen(false);
            setIsAdminOpen(false);
            setIsAIOpen(false);
            setIsAboutOpen(false);

            if (target === 'products') {
                setIsProductsOpen(true);
                window.history.pushState(null, '', '/products');
            } else if (target === 'collections') {
                setIsCollectionsOpen(true);
                window.history.pushState(null, '', '/collections');
            } else if (target === 'admin') {
                setIsAdminOpen(true);
                window.history.pushState(null, '', '/admin');
            } else if (target === 'ai-studio') {
                setIsAIOpen(true);
                window.history.pushState(null, '', '/ai-flower-studio');
            } else if (target === 'about') {
                setIsAboutOpen(true);
                window.history.pushState(null, '', '/about');
            } else {
                window.history.pushState(null, '', '/');
            }
            
            setTransitionState('out');
            setTimeout(() => {
                setTransitionState('idle');
            }, 600);
        }, 600);
    };


    const handleLoginClick = (e) => {
        if (e) e.preventDefault();
        const { user } = getStoredAuth();
        if (user && (user.role === 'Admin' || user.role === 'Staff')) {
            handleNavigate('admin');
        } else {
            setIsLoginOpen(true);
        }
    };

    useEffect(() => {
        // Tự động phát nhạc khi người dùng tương tác lần đầu (CHỈ khi đang ở trang home)
        const handleFirstInteraction = () => {
            if (isHomePage && bgAudioRef.current && !isMuted) {
                bgAudioRef.current.play().catch(e => console.log("Blocked by browser:", e));
            }
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
        };
        if (isHomePage) {
            window.addEventListener('click', handleFirstInteraction);
            window.addEventListener('scroll', handleFirstInteraction);
        }

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
        };
    }, [isHomePage, isMuted]);

    const toggleMute = () => {
        if (bgAudioRef.current) {
            if (isMuted) {
                bgAudioRef.current.play();
                setIsMuted(false);
            } else {
                bgAudioRef.current.pause();
                setIsMuted(true);
            }
        }
    };
    useEffect(() => {
        const bg = document.getElementById('custom-bg');
        let requestRef;

        // Parallax logic with 3D tilt
        let targetX = 0, targetY = 0;
        let targetRotateX = 0, targetRotateY = 0;

        let currentX = 0, currentY = 0;
        let currentRotateX = 0, currentRotateY = 0;
        let lastDropX = 0;
        let lastDropY = 0;

        const handleMouseMove = (e) => {
            const xPercent = e.clientX / window.innerWidth - 0.5;
            const yPercent = e.clientY / window.innerHeight - 0.5;

            targetX = xPercent * 60; // Dịch chuyển tới 60px
            targetY = yPercent * 60;
            targetRotateX = -(yPercent * 4); // Nghiêng lên/xuống tới 4 độ
            targetRotateY = xPercent * 4;   // Nghiêng trái/phải tới 4 độ

            // Kích hoạt thủ công hiệu ứng gợn sóng (xuyên thấu z-index)
            if (window.$ && window.$().ripples) {
                const bgRect = bg.getBoundingClientRect();
                const dropX = e.clientX - bgRect.left;
                const dropY = e.clientY - bgRect.top;

                // Tránh thả sóng liên tục làm nổ shader (gây trắng màn hình), chỉ thả khi chuột đi xa 40px
                const dist = Math.hypot(dropX - lastDropX, dropY - lastDropY);
                if (dist > 40) {
                    window.$('#custom-bg').ripples('drop', dropX, dropY, 8, 0.01);
                    lastDropX = dropX;
                    lastDropY = dropY;
                }
            }
        };

        const animate = () => {
            if (bg) {
                // Tốc độ lerp cực mượt (0.05) thay vì bị giật lag
                currentX += (targetX - currentX) * 0.05;
                currentY += (targetY - currentY) * 0.05;
                currentRotateX += (targetRotateX - currentRotateX) * 0.05;
                currentRotateY += (targetRotateY - currentRotateY) * 0.05;

                bg.style.transform = `translate(${-currentX}px, ${-currentY}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
            }
            requestRef = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        requestRef = requestAnimationFrame(animate);

        // Initialize Water Ripples
        const initRipples = () => {
            console.log('Checking for jQuery Ripples...', !!window.$, !!(window.$ && window.$().ripples));
            if (window.$ && window.$().ripples) {
                console.log('Initializing Ripples!');
                window.$('#custom-bg').ripples({
                    resolution: 1024, // Tăng phân giải để kìm hãm độ lan
                    dropRadius: 8,
                    perturbance: 0.01, // Giảm khúc xạ xuống tối thiểu
                    imageUrl: '/wp-content/themes/unseen/public/images/background.png' // Truyền trực tiếp ảnh
                });
            } else {
                setTimeout(initRipples, 500);
            }
        };
        initRipples();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef);
            if (window.$ && window.$().ripples) {
                window.$('#custom-bg').ripples('destroy');
            }
        };
    }, []);

    return (
        <>
            <div className="custom-bg-wrapper" style={{ transformStyle: 'preserve-3d' }}>
                {/* WebGL background đã được chuyển ra index.html để tránh lỗi */}
                {/* Khối chữ trung tâm lơ lửng 3D */}
                <div className="absolute top-0 left-0 w-100 h-100 d-flex flex-column justify-center items-center pointer-events-none"
                    style={{ width: '100vw', height: '100vh', transform: 'translateZ(80px)' }}>
                    <div style={{
                        fontSize: '12px',
                        letterSpacing: '0.15em',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                        color: '#fffaf0',
                        textShadow: '0px 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        A brand, digital & motion studio
                    </div>
                    <div style={{ textAlign: 'center', lineHeight: '0.8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="central-text-hover" data-audio-enter="audio.ratchet" style={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontStyle: 'italic',
                            fontSize: '110px',
                            fontWeight: '600',
                            color: '#fffaf0',
                            textShadow: '0px 4px 20px rgba(0,0,0,0.4)'
                        }}>
                            Creating the
                        </div>
                        <div className="central-text-hover" data-audio-enter="audio.ratchet" style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontStyle: 'normal',
                            fontSize: '120px',
                            letterSpacing: '-0.04em',
                            fontWeight: '500',
                            color: '#fffaf0',
                            textShadow: '0px 4px 20px rgba(0,0,0,0.4)'
                        }}>
                            unexpected
                        </div>
                    </div>
                </div>
            </div>


            <div className="loader loader--animate js-loader">
                <div className="loader__inner">
                    <div className="loader__wrap js-loader-box">
                        <div className="loader__box">
                            <div>U</div>
                            <div>N</div>
                            <div>S</div>
                            <div>E</div>
                            <div>N</div>
                            <div>E</div>
                        </div>
                    </div>
                    <span className="loader__title">Unseen Studio®</span>
                    <p className="loader__tagline">A brand, digital and motion studio creating<br />refreshingly unexpected ideas and striking visuals<br />that help bold brands cut through the noise.</p>
                </div>
                <button className="loader__btn js-enter-no-audio-btn">Enter without audio<span></span><span></span></button>
                <div className="loader__progress js-loader-progress">
                    <div className="js-loader-progress-inner">
                        <div className="loader__inner">
                            <div className="loader__wrap js-loader-box">
                                <div className="loader__box loader__box--pink">
                                    <div>U</div>
                                    <div>N</div>
                                    <div>S</div>
                                    <div>E</div>
                                    <div>N</div>
                                    <div>E</div>
                                </div>
                            </div>
                            <div className="loader__eyes-container">
                                <svg width="311.3" height="233.3" className="loader__eyes | js-eyes" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 311.3 233.3">

                                    <defs>
                                        <clipPath id="mask-left">
                                            <path className="eyes-st1" d="M139.5,101.5c2.5-7.8,6-14.8,10.3-21c0-0.1-0.1-0.2-0.1-0.3c-3.8-11.2-11.1-19-20.6-22
c-2.8-0.9-5.6-1.3-8.5-1.3c-7,0-14.2,2.5-21,7.5C89.8,71.3,82.2,82.4,78,95.5c-4.1,13.1-4.3,26.5-0.4,37.9
c3.8,11.2,11.1,19,20.6,22c9.4,3,19.9,0.8,29.5-6.1c3.5-2.5,6.7-5.6,9.6-9.1C134.6,128,135.3,114.6,139.5,101.5z"/>
                                        </clipPath>
                                        <clipPath id="mask-right">
                                            <path className="eyes-st1" d="M206,58.9c-3.8-1.2-7.6-1.8-11.4-1.8c-21.7,0-43.6,18.2-52.2,45.3c-4.9,15.5-4.8,31.6,0.3,45.3
c5.1,13.6,14.5,23.1,26.6,27c12,3.8,25.3,1.4,37.2-6.7c12.1-8.2,21.5-21.3,26.4-36.8C243,99.2,230.9,66.8,206,58.9z"/>
                                        </clipPath>
                                    </defs>
                                    <g className="left-container">
                                        <ellipse transform="matrix(0.3023 -0.9532 0.9532 0.3023 -22.508 182.8248)" className="eyes-st0" cx="113.6" cy="106.8"
                                            rx="52.5" ry="38.8" />
                                    </g>
                                    <g clipPath="url(#mask-left)">
                                        <g className="js-eyes-left">
                                            <g className="js-eyes-normal">
                                                <ellipse transform="matrix(0.2938 -0.9559 0.9559 0.2938 -24.3184 186.5732)" cx="114.1" cy="109.7" rx="33"
                                                    ry="23.5" />
                                                <circle className="eyes-st1" cx="132.6" cy="120.7" r="11" />
                                            </g>
                                            <path className="js-eyes-heart eyes-st4" d="M131.8,98.8c-0.9-2.8-3-5.3-5.8-6.2c-4.1-1.3-9.1,1.2-11.5,4.6c-1.5,2.1-2.1,4.6-2.9,7
c-0.2,0.8-0.8,4-1.8,2.2c-2.2-3.7-6.4-6.2-10.7-4.7c-3.2,1.1-5.2,4.3-5.9,7.4c-1,5,1.4,9.9,4.9,13.4c2.6,2.6,5.7,4.6,8.9,6.5
c1.7,1,3.6,1.7,5.2,2.8c1.4,1,4.1,5.8,5.4,3.1c1.1-2.4,1.6-5.1,3-7.4c1.5-2.6,3.4-5,5.1-7.5c3.3-4.7,6.8-9.8,6.9-15.8
C132.7,102.5,132.5,100.6,131.8,98.8z"/>
                                        </g>
                                        <rect className="js-eyes-eyelid-left-top eyes-st3" x="62.9" y="22.3" width="103.2" height="78.5" />
                                        <rect className="js-eyes-eyelid-left-bottom eyes-st3" x="65.1" y="125.7" width="89.3" height="78.5" />
                                    </g>
                                    <g className="right-container">
                                        <ellipse transform="matrix(0.3023 -0.9532 0.9532 0.3023 19.5634 260.2873)" className="eyes-st0" cx="187.6" cy="116.8"
                                            rx="62.3" ry="49" />
                                    </g>
                                    <g clipPath="url(#mask-right)">
                                        <g className="js-eyes-right">
                                            <g className="js-eyes-normal">
                                                <ellipse transform="matrix(0.2938 -0.9559 0.9559 0.2938 23.4151 259.1791)" cx="187.1" cy="113.7" rx="35.9"
                                                    ry="25.6" />
                                                <circle className="eyes-st1" cx="208.6" cy="121.7" r="11" />
                                            </g>
                                            <path className="js-eyes-heart eyes-st4" d="M158.8,104.8c0.1-7,5.7-13.4,13.1-12.3c2.6,0.4,4.9,1.7,6.8,3.4c1.2,1.1,4,7.1,5.5,4.2
c2.4-4.8,7.4-9,12.8-9.9c6.5-1.1,11.6,3.8,12.9,9.9c1.6,7.7-3.9,14.6-8.8,19.9c-5.7,6.1-12.8,11.8-15.3,20
c-1.5,4.8-3.8-0.8-5.1-2.8c-1.7-2.6-4-4.7-6.3-6.7c-4.7-4.3-10-8.5-12.9-14.3C160,113,158.8,108.8,158.8,104.8z"/>
                                        </g>
                                        <rect className="js-eyes-eyelid-right-top eyes-st3" x="130.6" y="22.3" width="117.6" height="78.5" />
                                        <rect className="js-eyes-eyelid-right-bottom eyes-st3" x="127.5" y="125.7" width="117.6" height="78.5" />
                                    </g>
                                </svg>
                            </div>
                            <span className="loader__title">Unseen Studio®</span>
                            <p className="loader__tagline">A brand, digital and motion studio creating<br />refreshingly unexpected ideas and striking visuals<br />that help bold brands cut through the noise.</p>
                            <button className="btn btn--regular btn--fill btn--light js-btn js-enter-btn" data-btn="fill" data-cursor="hide">
                                <span className="btn__inner js-btn-inner">
                                    <span className="btn__content js-btn-content">
                                        <span className="d-flex flex-row items-end">
                                            <span className="btn__text">
                                                Enter
                                            </span>
                                            <svg className="btn__icon d-inline-block js-btn-icon">
                                                <use xlinkHref="https://unseen.co/wp-content/themes/unseen/public/images/svgsprite.svg#arrow"></use>
                                            </svg>
                                        </span>
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="naked-loader js-naked-loader">
                <div className="loader__inner">
                    <div className="loader__wrap js-naked-loader-wrap">
                        <div className="loader__box">
                            <div className="js-naked-loader-box">U</div>
                            <div className="js-naked-loader-box">N</div>
                            <div className="js-naked-loader-box">S</div>
                            <div className="js-naked-loader-box">E</div>
                            <div className="js-naked-loader-box">N</div>
                            <div className="js-naked-loader-box">E</div>
                        </div>
                    </div>
                </div>
                <div className="naked-loader__text absolute t-sans t-uppercase t-1.3 t-normal t-lh-1 js-naked-loader-text">
                    <div>(Loading)</div>
                </div>
            </div>
            <header className="header fixed d-flex items-center w-1/1 p-1 px-2@sm z-80 justify-center justify-between@sm">
                <div className="header__logo d-flex absolute relative@sm items-center flex-no-shrink h-1/1 pointer-events-none">
                    <a href="#" onClick={(e) => e.preventDefault()} className="brand-header-link d-flex items-center pointer-events-auto" data-cursor="hide" title="Dệt Sắc Hoa">
                        <img 
                            src="/logo/DetSacHoa_Logo.png" 
                            alt="Logo Dệt Sắc Hoa" 
                            className="brand-header-logo"
                        />
                        <span className="brand-header-title">
                            Dệt Sắc Hoa
                        </span>
                    </a>
                </div>
                <div className="d-flex justify-end items-center w-1/1 w-auto@sm js-navigation">
                    <nav className="overflow-hidden d-block js-nav-inner" data-cursor="navWrapper">
                        <div className="d-none d-flex@sm align-center justify-end">
                            <a href="#" className="nav-item js-nav-item js-nav-home" data-cursor="navItem" data-audio-enter="audio.ratchet" aria-label="Sản Phẩm" title="Sản Phẩm" onClick={(e) => { e.preventDefault(); handleNavigate('products'); }}>
                                <div className="relative">
                                    <div className="nav-item__text t-lh-1.1 t-1.2 js-nav-item-text">Sản Phẩm</div>
                                    <div className="nav-item__text--hover t-lh-0.9 absolute t-serif t-1.3 t-italic js-nav-item-hover-text">Sản Phẩm</div>
                                </div>
                            </a>
                            <a href="#" className="nav-item js-nav-item" data-cursor="navItem" data-audio-enter="audio.ratchet" aria-label="Bộ Sưu Tập" title="Bộ Sưu Tập" onClick={(e) => { e.preventDefault(); handleNavigate('collections'); }}>
                                <div className="relative">
                                    <div className="nav-item__text t-lh-1.1 t-1.2 js-nav-item-text">Bộ Sưu Tập</div>
                                    <div className="nav-item__text--hover t-lh-0.9 absolute t-serif t-1.3 t-italic js-nav-item-hover-text" style={{ paddingLeft: '0.1rem' }}>Bộ Sưu Tập</div>
                                </div>
                            </a>
                            <a href="#" className="nav-item js-nav-item" data-cursor="navItem" data-audio-enter="audio.ratchet" aria-label="Giới Thiệu" title="Giới Thiệu" onClick={(e) => { e.preventDefault(); handleNavigate('about'); }}>
                                <div className="relative">
                                    <div className="nav-item__text t-lh-1.1 t-1.2 js-nav-item-text">Giới Thiệu</div>
                                    <div className="nav-item__text--hover t-lh-0.9 absolute t-serif t-1.3 t-italic js-nav-item-hover-text" style={{ paddingLeft: '0.1rem' }}>Giới Thiệu</div>
                                </div>
                            </a>
                            <a href="#" className="nav-item js-nav-item js-nav-contact" data-cursor="navItem" data-audio-enter="audio.ratchet" aria-label="Đăng Nhập" title="Đăng Nhập" onClick={handleLoginClick}>
                                <div className="relative">
                                    <div className="nav-item__text t-lh-1.1 t-1.2 js-nav-item-text">Đăng Nhập</div>
                                    <div className="nav-item__text--hover t-lh-0.9 absolute t-serif t-1.3 t-italic js-nav-item-hover-text">Đăng Nhập</div>
                                </div>
                            </a>
                        </div>
                    </nav>
                    <button className="btn btn--circle menu-btn d-flex js-menu-toggle" data-cursor="hide" data-audio-enter="audio.hover">
                        <span className="sr">Toggle Menu</span>
                        <div className="btn__bg absolute d-block menu-btn__bg js-menu-toggle-bg"></div>
                        <svg viewBox="0 0 14 5" className="btn__icon menu-btn__icon relative js-menu-icon" fill="none">
                            <circle cx="2.4" className="js-menu-icon-circle" cy="2.4" r="2.4" fill="#212121" />
                            <circle cx="11.6" className="js-menu-icon-circle" cy="2.4" r="2.4" fill="#212121" />
                        </svg>
                        <div className="btn__inner menu-btn__inner absolute">
                            <span className="btn__inner-bg menu-btn__inner-bg js-menu-toggle-inner-bg"></span>
                            <svg viewBox="0 0 14 14" className="btn__inner-icon menu-btn__inner-icon js-menu-toggle-inner-icon">
                                <path d="M2.269.572L.572 2.269l4.56 4.56-4.496 4.498 1.612 1.612 4.497-4.497 4.56 4.56 1.698-1.696-4.561-4.561 4.497-4.497L11.327.635 6.83 5.133 2.269.572z" fill="#fff" />
                            </svg>
                        </div>
                    </button>
                </div>
            </header>
            {typeof document !== 'undefined' && createPortal(
                <>
                    <div className="menu overflow-hidden fixed z-70 h-1/1 js-menu" style={{ height: '100vh', top: 0, bottom: 0 }}>
                        <div className="menu__inner absolute h-1/1 d-flex justify-center justify-start@lg items-center js-menu-inner" style={{ height: '100vh', top: 0, bottom: 0 }}>
                            <div className="menu__nav d-flex items-start w-auto w-1/1@lg">
                                <a href="#" className="menu__nav-item relative d-flex items-start js-menu-item js-nav-home" data-cursor="hide" aria-label="Sản Phẩm" title="Sản Phẩm" onClick={(e) => { e.preventDefault(); handleNavigate('products'); }}>
                                    <span className="menu__nav-number js-menu-number">01</span>
                                    <span className="menu__text t-ls-tighter relative js-menu-text">
                                        Sản Phẩm
                                        <span className="menu__underline js-active-underline"></span>
                                    </span>
                                    <span className="t-serif t-italic t-ls-tighter menu__hover-text js-menu-hover-text">Sản Phẩm</span>
                                </a>
                                <a href="#" className="menu__nav-item relative d-flex items-start js-menu-item" data-cursor="hide" aria-label="Bộ Sưu Tập" title="Bộ Sưu Tập" onClick={(e) => { e.preventDefault(); handleNavigate('collections'); }}>
                                    <span className="menu__nav-number js-menu-number">02</span>
                                    <span className="menu__text t-ls-tighter relative js-menu-text">
                                        Bộ Sưu Tập
                                        <span className="menu__underline js-active-underline"></span>
                                    </span>
                                    <span className="t-serif t-italic t-ls-tighter menu__hover-text js-menu-hover-text">Bộ Sưu Tập</span>
                                </a>
                                <a href="#" className="menu__nav-item relative d-flex items-start js-menu-item" data-cursor="hide" aria-label="AI Studio" title="AI Studio" onClick={(e) => { e.preventDefault(); handleNavigate('ai-studio'); }}>
                                    <span className="menu__nav-number js-menu-number">03</span>
                                    <span className="menu__text t-ls-tighter relative js-menu-text">
                                        AI Studio
                                        <span className="menu__underline js-active-underline"></span>
                                    </span>
                                    <span className="t-serif t-italic t-ls-tighter menu__hover-text js-menu-hover-text">AI Studio</span>
                                </a>
                                <a href="#" className="menu__nav-item relative d-flex items-start js-menu-item" data-cursor="hide" aria-label="Giới Thiệu" title="Giới Thiệu" onClick={(e) => { e.preventDefault(); handleNavigate('about'); }}>
                                    <span className="menu__nav-number js-menu-number">04</span>
                                    <span className="menu__text t-ls-tighter relative js-menu-text">
                                        Giới Thiệu
                                        <span className="menu__underline js-active-underline"></span>
                                    </span>
                                    <span className="t-serif t-italic t-ls-tighter menu__hover-text js-menu-hover-text">Giới Thiệu</span>
                                </a>
                            </div>
                            <div className="menu__footer absolute d-flex justify-between items-end">
                                <div>
                                    <a className="d-block arrow-link js-menu-link" data-audio-enter="audio.ratchet" href="mailto:detsachoa@gmail.com" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>detsachoa@gmail.com</span></a>
                                    <a className="d-block arrow-link js-menu-link" data-audio-enter="audio.ratchet" href="tel:+84912172192" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>(+84) 912 172 192</span></a>
                                </div>
                                <div className="overflow-hidden">
                                    <a className="social-link arrow-link js-social-links" data-audio-enter="audio.ratchet" href="https://twitter.com/uns__nstudio" rel="nofollow" target="_blank" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>Twitter</span></a>
                                    <a className="social-link arrow-link js-social-links" data-audio-enter="audio.ratchet" href="https://www.instagram.com/uns__nstudio/" rel="nofollow" target="_blank" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>Instagram</span></a>
                                    <a className="social-link arrow-link js-social-links" data-audio-enter="audio.ratchet" href="https://www.linkedin.com/company/un-seen-studio" rel="nofollow" target="_blank" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>LinkedIn</span></a>
                                    <a className="social-link arrow-link js-social-links" data-audio-enter="audio.ratchet" href="https://dribbble.com/unseenstudio" rel="nofollow" target="_blank" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>Dribbble</span></a>
                                    <a className="social-link arrow-link js-social-links" data-audio-enter="audio.ratchet" href="https://www.behance.net/unseen-studio" rel="nofollow" target="_blank" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>Behance</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fixed fill z-40 js-menu-wrapper" style={{ display: 'none' }}></div>
                </>,
                document.body
            )}
            <div 
                className="cursor js-cursor"
                style={{
                    display: isHomePage ? 'block' : 'none',
                    visibility: isHomePage ? 'visible' : 'hidden',
                    opacity: isHomePage ? 1 : 0,
                    pointerEvents: 'none',
                    transform: 'translate3d(-2000px, -2000px, 0)'
                }}
            >
                <div className="cursor__wrap js-cursor-wrap">
                    <div className="cursor__inner js-cursor-inner">
                        <span className="cursor__circle absolute fill js-cursor-circle"></span>
                    </div>
                    <span className="cursor__hold absolute fill">
                        <span className="cursor__hold-inner absolute fill js-cursor-hold-inner"></span>
                        <span className="cursor__hold-outer absolute fill js-cursor-hold-outer"></span>
                    </span>
                    <span className="cursor__video video-indicator video-indicator--cursor absolute fill">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="49" className="video-indicator__outer js-cursor-video-outer" />
                            <g className="js-cursor-video-icon">
                                <path className="js-cursor-video-play" d="M58,49.1c0.7,0.4,0.7,1.3,0,1.7l-14.2,8.2c-0.7,0.4-1.5-0.1-1.5-0.9V41.8c0-0.8,0.8-1.3,1.5-0.9L58,49.1z" fill="#040404" />
                                <g className="js-cursor-video-pause">
                                    <path d="M47.1,38.5h-4.2c-0.7,0-1.2,0.6-1.2,1.2v17.5c0,0.7,0.6,1.2,1.2,1.2h4.2c0.7,0,1.2-0.6,1.2-1.2V39.7
C48.3,39.1,47.8,38.5,47.1,38.5z" />
                                    <path d="M57.1,38.5h-4.2c-0.7,0-1.2,0.6-1.2,1.2v17.5c0,0.7,0.6,1.2,1.2,1.2h4.2c0.7,0,1.2-0.6,1.2-1.2V39.7
C58.3,39.1,57.8,38.5,57.1,38.5z" />
                                </g>
                            </g>
                        </svg>
                    </span>
                    <span className="cursor__click-hold-prompt absolute fill | js-cursor-click-hold-prompt">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="14" y1="25" x2="34" y2="25" strokeWidth="2" />
                            <line opacity="0.4" x1="16" y1="20" x2="32" y2="20" strokeWidth="2" />
                            <line opacity="0.4" x1="16" y1="30" x2="32" y2="30" strokeWidth="2" />
                            <circle cx="24" cy="24" r="23.5" />
                        </svg>
                        <span>
                            <span>Click &amp; Hold</span>
                        </span>
                    </span>
                    <span className="absolute fill cursor__drag | js-cursor-drag">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="49" className="video-indicator__outer" />
                        </svg>
                        <svg className="cursor__drag__arrows" width="46" height="10" viewBox="0 0 46 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M14.1667 5.625H2.15333L5.32667 9.125L4.53333 10L0 5L4.53333 0L5.32667 0.875L2.15333 4.375H14.1667V5.625Z" fill="black" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M31.0001 4.375L43.0134 4.375L39.8401 0.875L40.6334 -3.96317e-07L45.1667 5L40.6334 10L39.8401 9.125L43.0134 5.625L31.0001 5.625L31.0001 4.375Z" fill="black" />
                        </svg>
                    </span>
                    <span className="absolute fill cursor__progress | js-cursor-progress">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle className="video-indicator__inner" cx="50" cy="50" r="39" stroke="#EAEAEA" />
                            <circle className="video-indicator__progress js-cursor-progress-ring" transform-origin="center center" transform="rotate(-90)" cx="50" cy="50" r="39" stroke="#6D6D6D" strokeDasharray="244px" strokeDashoffset="244px" />
                        </svg>
                    </span>
                </div>
            </div>

            <h1 className="d-none" style={{ display: 'none' }}>Home</h1>
            <div className="fixed fill w-1/1 h-1/1 z-40 user-select-none pointer-events-none">
                <canvas id="gl"></canvas>
            </div>
            <div className="fixed top left w-1/1 h-1/1 d-flex items-center justify-center z-50 pointer-events-none user-select-none js-world-intro" style={{ visibility: 'hidden' }}>
                <div className="world-intro">
                    <div className="mb-1">
                        <svg><use xlinkHref="https://unseen.co/wp-content/themes/unseen/public/images/svgsprite.svg#drag-globe"></use></svg>
                    </div>
                    <div className="overflow-hidden">
                        <p className="t-white t-center mb-0">Drag to explore our world</p>
                    </div>
                </div>
            </div>
            <div className="project-filters | js-project-filters" style={{ display: 'none', visibility: 'hidden', opacity: 0, pointerEvents: 'none', position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden', zIndex: -9999 }}>
                <div className="project-filters__overlay js-project-filters:overlay"></div>
                <div className="project-filters__inner | js-project-filters-inner">
                    <h1 className="project-filters__title | t-sans t-offblack t-center t-ls--2">Selected Projects</h1>
                    <div className="project-filters__filter | js-project-filters:filter">
                        <div className="project-filters__filter__bg | pointer-events-none | js-project-filters:filterBg"></div>
                        <button className="project-filters__filter__toggle d-none@md | js-project-filters:toggle">
                            Filter
                            <svg className="project-filters__filter__chevron js-project-filters:chevron">
                                <use xlinkHref="https://unseen.co/wp-content/themes/unseen/public/images/svgsprite.svg#chevron-down"></use>
                            </svg>
                        </button>
                        <div className="project-filters__filter__list | js-project-filters:filterList">
                            <button data-filter="all" className="project-filters__filter__button | is-active js-project-filters:filterBtn">All
                                <div className="js-project-filters:filter:number"></div>
                            </button>
                            <button data-filter="branding" className="project-filters__filter__button | js-project-filters:filterBtn">Branding
                                <div className="js-project-filters:filter:number"></div>
                            </button>
                            <button data-filter="digital" className="project-filters__filter__button | js-project-filters:filterBtn">Digital
                                <div className="js-project-filters:filter:number"></div>
                            </button>
                            <button data-filter="motion" className="project-filters__filter__button | js-project-filters:filterBtn">Motion
                                <div className="js-project-filters:filter:number"></div>
                            </button>
                            <button data-filter="experiment" className="project-filters__filter__button | js-project-filters:filterBtn">Experiment
                                <div className="js-project-filters:filter:number"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-none" style={{ display: 'none', visibility: 'hidden', opacity: 0, pointerEvents: 'none', position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden', zIndex: -9999 }}>

                <div className="js-view-projects-btn" style={{ display: 'none', visibility: 'hidden', opacity: 0, pointerEvents: 'none', position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden', zIndex: -9999 }}>
                    <a href="#hidden" title="" className="btn btn--regular btn--fill btn--light js-manager-ignore js-btn" data-btn="fill" data-cursor="hide" style={{ display: 'none', visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}>
                        <span className="btn__inner js-btn-inner">
                            <span className="btn__content js-btn-content">
                                <span className="d-flex flex-row items-end">
                                    <span className="btn__text"></span>
                                </span>
                            </span>
                        </span>
                    </a>
                </div>

                <div className="w-1/1 w-auto@sm js-contact-content" style={{ display: 'none', visibility: 'hidden', opacity: 0, pointerEvents: 'none', position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden', zIndex: -9999 }}>
                    <div className="d-flex flex-column flex-row@sm mt-8 mt-0@sm pb-5 pb-0@sm">
                        <div className="d-flex flex-column items-center items-end@sm mr-2@sm">
                            <div className="mb-2 | js-reveal-anim">
                                <h2 className="t-center t-5 t-6@sm t-lh-0.9 mb-0">
                                    <span className="d-block t-serif t-normal t-ls-tighter t-italic">Say hello</span>
                                </h2>
                            </div>
                            <div className="d-flex justify-end t-center t-right@sm t-uppercase t-lh-1.3 | js-reveal-anim">
                                <p className="t-0.9 mb-0">we look forward<br /> to hearing from you</p>
                            </div>
                        </div>
                        <div className="d-flex flex-column mt-1 mt-2.5@sm">
                            <div className="d-flex items-center items-end@sm justify-center justify-start@sm mb-1 mb-2@sm | js-reveal-anim">
                                <div className="mr-1 d-flex">
                                    <a href="#" title="New Business" className="btn btn--regular btn--border btn--dark js-content-toggle-btn js-btn-selected js-manager-ignore js-btn" data-btn="border" data-togglecontent="new-business" data-router-disabled data-audio-enter="audio.hover" data-cursor="hide">
                                        <span className="btn__inner js-btn-inner">
                                            <span className="btn__content js-btn-content">
                                                <span className="d-flex flex-row items-end">
                                                    <span className="btn__text">
                                                        New Business
                                                    </span>
                                                    <svg className="btn__icon d-inline-block js-btn-icon">
                                                        <use xlinkHref="https://unseen.co/wp-content/themes/unseen/public/images/svgsprite.svg#arrow"></use>
                                                    </svg>
                                                </span>
                                            </span>
                                        </span>
                                    </a>
                                </div>
                                <div className="d-flex | js-reveal-anim">
                                    <a href="#" title="General" className="btn btn--regular btn--border btn--dark js-content-toggle-btn js-btn-not-selected js-manager-ignore js-btn" data-btn="border" data-togglecontent="general" data-router-disabled data-cursor="hide">
                                        <span className="btn__inner js-btn-inner">
                                            <span className="btn__content js-btn-content">
                                                <span className="d-flex flex-row items-end">
                                                    <span className="btn__text">
                                                        General
                                                    </span>
                                                    <svg className="btn__icon d-inline-block js-btn-icon">
                                                        <use xlinkHref="https://unseen.co/wp-content/themes/unseen/public/images/svgsprite.svg#arrow"></use>
                                                    </svg>
                                                </span>
                                            </span>
                                        </span>
                                    </a>
                                </div>
                            </div>
                            <div className="t-center t-left@sm relative js-content-toggle | js-reveal-anim">
                                <div data-content="general" className="js-content-toggle-section">
                                    <div className="t-normal mb-1 t-center overflow-hidden t-left@sm">
                                        <a href="mailto:hello@unseen.co" className="t-lh-1 t-2 t-no-underline t-300 d-block arrow-link arrow-link--large" data-cursor="hide"><span><span><span>&#11169;&nbsp;&nbsp;</span></span>hello@unseen.co</span></a>
                                    </div>
                                    <div className="d-flex flex-column flex-row@sm">
                                        <div className="mr-2@sm">
                                            <span className="d-block t-uppercase t-base t-small@sm mb-0.25 t-center overflow-hidden t-left@sm">Bristol</span>
                                            <p className="t-1.2 t-lh-1.3 t-center overflow-hidden t-left@sm">
                                                35a Colston Avenue<br /> Bristol, BS1 4TT
                                            </p>
                                        </div>
                                        <div>
                                            <span className="d-block t-uppercase t-base t-small@sm mb-0.25 t-center overflow-hidden t-left@sm">London</span>
                                            <p className="t-1.2 t-lh-1.3 t-center overflow-hidden t-left@sm">
                                                90 Paul Street<br /> London, EC2A 4NE
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/1 absolute top js-content-toggle-section" data-content="new-business">
                                    <div>
                                        <div className="t-normal overflow-hidden mb-0.25">
                                            <a href="mailto:projects@unseen.co" className="t-lh-1.1 t-2 t-no-underline t-300 d-block arrow-link arrow-link--large" data-cursor="hide"><span><span><span>&#11169;&nbsp;&nbsp;</span></span>projects@unseen.co</span></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="p-cover"></div>
            <div className="asscrollbar">
                <div className="asscrollbar__handle">
                    <div></div>
                </div>
            </div>
            <div className="height-div"></div>
            
            {isLoginOpen && (
                <Login 
                    onClose={() => setIsLoginOpen(false)} 
                    onAdminLogin={(user) => {
                        setIsLoginOpen(false);
                        handleNavigate('admin');
                    }}
                />
            )}
            {isProductsOpen && <Products onClose={() => handleNavigate('home')} />}
            {isCollectionsOpen && <Collections onClose={() => handleNavigate('home')} />}
            {isAdminOpen && <AdminLayout onClose={() => handleNavigate('home')} />}
            {isAIOpen && <AIFlowerStudio onClose={() => handleNavigate('home')} />}
            {isAboutOpen && <About onClose={() => handleNavigate('home')} onNavigate={(page) => handleNavigate(page)} />}

            {/* Hiệu ứng chuyển trang (Curtain) */}
            <div 
                className="page-transition-curtain"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: '#0a0a0a',
                    zIndex: 9999,
                    pointerEvents: transitionState === 'idle' ? 'none' : 'auto',
                    transform: transitionState === 'idle' ? 'translateX(-100%)' : (transitionState === 'in' ? 'translateX(0)' : 'translateX(100%)'),
                    transition: transitionState === 'idle' ? 'none' : 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)'
                }}
            ></div>

            {/* Giữ lại footer gốc cho theme.js nếu có script cần */}
            <div className="footer" style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', height: 0, zIndex: 50, pointerEvents: 'none' }}>
                <div className="footer__cta z-50 fixed d-flex justify-center justify-start@md js-footer-cta" style={{ display: 'none' }}>
                    <a href="https://2025.unseen.co/" target="_blank" title="Our 2025 Wrapped" className="btn btn--regular btn--border btn--light js-rebrand-btn js-btn" data-btn="border" data-cursor="hide">
                        <span className="btn__inner js-btn-inner">
                            <span className="btn__content js-btn-content">
                                <span className="d-flex flex-row items-end">
                                    <span className="btn__text">Our 2025 Wrapped</span>
                                </span>
                            </span>
                        </span>
                    </a>
                </div>
                <div className="footer__cr z-50 fixed d-none d-block@md js-footer-cr" style={{ zIndex: 99999 }}>&#169;2026</div>
            </div>

            {/* CỤM ĐIỀU KHIỂN: NÚT NHẠC VÀ UNSEEN WORLD (CHỈ HIỂN THỊ Ở TRANG HOME) */}
            {typeof document !== 'undefined' && createPortal(
                <div 
                    id="persistent-portal-root"
                    className="persistent-controls"
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100vw',
                        height: 0,
                        zIndex: 999999,
                        pointerEvents: 'none',
                        overflow: 'visible',
                        display: isHomePage ? 'block' : 'none'
                    }}
                >
                    <audio
                        ref={bgAudioRef}
                        src="/wp-content/themes/unseen/resources/assets/audio/audio.webm"
                        loop
                    />
                    
                    {/* Mute Button (CHỈ Ở TRANG HOME) */}
                    <button 
                        type="button"
                        onClick={toggleMute} 
                        className={`btn btn--circle d-flex mute-btn js-mute mute-btn--global js-global-mute-btn ${isMuted ? 'is-muted-custom' : ''}`}
                        data-cursor="hide" 
                        data-audio-enter="audio.hover"
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            left: '2rem',
                            zIndex: 999999,
                            pointerEvents: isHomePage ? 'auto' : 'none',
                            display: isHomePage ? 'flex' : 'none',
                            visibility: isHomePage ? 'visible' : 'hidden',
                            opacity: isHomePage ? 1 : 0
                        }}
                    >
                        <span className="sr">Toggle Sound</span>
                        <div className="btn__bg mute-btn__bg absolute d-block js-mute-bg"></div>
                        <svg className="btn__icon mute-btn__icon absolute fill js-mute-icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 18 16" enableBackground="new 0 0 18 16" xmlSpace="preserve">
                            <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="1" y1="0" x2="1" y2="16" />
                            <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="13" y1="0" x2="13" y2="16" />
                            <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="5" y1="0" x2="5" y2="16" />
                            <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="17" y1="0" x2="17" y2="16" />
                            <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="9" y1="0" x2="9" y2="16" />
                            {/* Tĩnh: 5 dấu chấm khi Mute */}
                            <circle className="muted-dot" cx="1" cy="8" r="1.5" />
                            <circle className="muted-dot" cx="5" cy="8" r="1.5" />
                            <circle className="muted-dot" cx="9" cy="8" r="1.5" />
                            <circle className="muted-dot" cx="13" cy="8" r="1.5" />
                            <circle className="muted-dot" cx="17" cy="8" r="1.5" />
                        </svg>
                        <div className="btn__inner mute-btn__inner absolute">
                            <span className="btn__inner-bg mute-btn__fill absolute fill js-mute-fill"></span>
                        </div>
                    </button>

                    {/* World Logo Button (CHỈ Ở TRANG HOME - BẤM VÀO SẼ MỞ AI STUDIO) */}
                    <a 
                        href="#ai-flower-studio" 
                        className="btn btn--circle world-btn d-flex js-world-btn" 
                        data-cursor="hide" 
                        data-audio-enter="audio.hover"
                        data-router-disabled="true"
                        title="Khám Phá Sáng Tạo AI 3D"
                        aria-label="Khám Phá Sáng Tạo AI 3D"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigate('ai-studio');
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 999999,
                            pointerEvents: isHomePage ? 'auto' : 'none',
                            display: isHomePage ? 'flex' : 'none',
                            visibility: isHomePage ? 'visible' : 'hidden',
                            opacity: isHomePage ? 1 : 0,
                            cursor: 'pointer'
                        }}
                    >
                        <div className="btn__bg world-btn__bg absolute js-world-inner-bg"></div>
                        <img src="/wp-content/themes/unseen/public/images/Logo_Detsachoa.png" alt="Dệt Sắc Hoa Logo" className="btn__icon world-btn__icon absolute js-world-icon" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
                        <div className="btn__inner world-btn__inner absolute z-40">
                            <span className="btn__inner-bg world-btn__bg absolute js-world-btn-hover"></span>
                            <img src="/wp-content/themes/unseen/public/images/Logo_Detsachoa.png" alt="Dệt Sắc Hoa Logo" className="btn__inner-icon world-btn__inner-icon absolute fill js-world-hover-icon" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px', zIndex: 10, filter: 'invert(1) brightness(100)' }} />
                            <div className="world-btn__text absolute fill z-40">
                                <div className="world-btn__text-left">
                                    <span className="t-uppercase js-world-text-left">3D</span>
                                </div>
                                <div className="world-btn__text-right">
                                    <span className="t-uppercase js-world-text-right">Studio</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>,
                document.body
            )}
        </>
    );
}
