import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Loader } from "./components/Loader"
import { TabMenuBar } from "./components/TabMenuBar";
import classNames from 'classnames';
import { BrowserRouter as Router } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group';
import { AppFooter } from './AppFooter';
import { AppMenu } from './AppMenu';
import PrimeReact from 'primereact/api';
import { Tooltip } from 'primereact/tooltip';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'flag-icons/css/flag-icons.min.css'
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';

import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import './assets/demo/flags/flags.css';
import './assets/demo/Demos.scss';
import './App.scss';
import './assets/layout/layout.scss';

import "quill/dist/quill.core.css"

import { AuthContext } from "./context/AuthContext";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";

import { addLocale } from 'primereact/api';

addLocale('ru', {
    firstDayOfWeek: 1,
    today: 'Сегодня',
    clear: 'Очистить',
    closeText: 'Закрыть',
    prevText: 'Назад',
    nextText: 'Вперёд',
    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    dayNamesShort: ['Воск', 'Пон', 'Вт', 'Ср', 'Четв', 'Пят', 'Суб'],
    dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    weekHeader: 'Неделя',
    FirstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: '',
    timeOnlyTitle: 'Только время',
    timeText: 'Время',
    hourText: 'Час',
    minuteText: 'Минута',
    secondText: 'Секунда',
    currentText: 'Сегодня',
    ampm: false,
    month: 'Месяц',
    week: 'неделя',
    day: 'День',
    allDayText: 'Весь день'
});

const App = () => {
    const { token, login, logout, userID, ready } = useAuth();

    const isAuthenticated = !!token;

    const [layoutMode] = useState('static');
    const [layoutColorMode] = useState('light')
    const [inputStyle] = useState('outlined');
    const [ripple] = useState(true);
    const [staticMenuInactive, setStaticMenuInactive] = useState(false);
    const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
    const copyTooltipRef = useRef();
    const routes = useRoutes(isAuthenticated, layoutColorMode);
    PrimeReact.ripple = true;
    let menuClick = false;
    let mobileTopbarMenuClick = false;

    useEffect(() => {
        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }
    }, [mobileMenuActive]);


    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }

        if (!mobileTopbarMenuClick) {
            setMobileTopbarMenuActive(false);
        }

        mobileTopbarMenuClick = false;
        menuClick = false;
    }

    const onToggleMenuClick = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === 'overlay') {
                if (mobileMenuActive === true) {
                    setOverlayMenuActive(true);
                }

                setOverlayMenuActive((prevState) => !prevState);
                setMobileMenuActive(false);
            }
            else if (layoutMode === 'static') {
                setStaticMenuInactive((prevState) => !prevState);
            }
        }
        else {
            setMobileMenuActive((prevState) => !prevState);
        }

        event.preventDefault();
    }

    const onSidebarClick = () => {
        menuClick = true;
    }

    const onMobileTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        setMobileTopbarMenuActive((prevState) => !prevState);
        event.preventDefault();
    }

    const onMobileSubTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        event.preventDefault();
    }

    const onMenuItemClick = (event) => {
        if (!event.item.items) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
    }
    const isDesktop = () => {
        return window.innerWidth >= 992;
    }

    const addClass = (element, className) => {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    const removeClass = (element, className) => {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    const wrapperClass = classNames('layout-wrapper', {
        'layout-overlay': layoutMode === 'overlay',
        'layout-static': layoutMode === 'static',
        'layout-static-sidebar-inactive': staticMenuInactive && layoutMode === 'static',
        'layout-overlay-sidebar-active': overlayMenuActive && layoutMode === 'overlay',
        'layout-mobile-sidebar-active': mobileMenuActive,
        'p-input-filled': inputStyle === 'filled',
        'p-ripple-disabled': ripple === false,
        'layout-theme-light': layoutColorMode === 'light'
    });

    if (!ready) {
        return (
            <Loader />
        )
    }
    document.documentElement.style.fontSize = 14 + 'px';

    return (
        <Suspense fallback={<Loader />}>
            <AuthContext.Provider value={{
                token, login, logout, userID, isAuthenticated
            }}>
                <Router>
                    <div className={wrapperClass} onClick={onWrapperClick}>
                        <Tooltip ref={copyTooltipRef} target=".block-action-copy" position="bottom" content="Copied to clipboard" event="focus" />

                        <TabMenuBar
                            onToggleMenuClick={onToggleMenuClick}
                            layoutColorMode={layoutColorMode}
                            mobileTopbarMenuActive={mobileTopbarMenuActive}
                            onMobileTopbarMenuClick={onMobileTopbarMenuClick}
                            onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick} />
                        <div className="layout-sidebar" onClick={onSidebarClick}>
                            <AppMenu onMenuItemClick={onMenuItemClick} layoutColorMode={layoutColorMode} />
                        </div>

                        <div className="layout-main-container">
                            <div className="layout-main">
                                {routes}
                            </div>

                            <AppFooter layoutColorMode={layoutColorMode} />
                        </div>
                        <CSSTransition classNames="layout-mask" timeout={{ enter: 200, exit: 200 }} in={mobileMenuActive} unmountOnExit>
                            <div className="layout-mask p-component-overlay"></div>
                        </CSSTransition>

                    </div>
                </Router>
            </AuthContext.Provider>
        </Suspense>
    );

}

export default App;
