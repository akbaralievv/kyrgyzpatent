import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
// import classNames from 'classnames';
import { classNames } from "primereact/utils";
import { Ripple } from "primereact/ripple";
import { Badge } from 'primereact/badge';

import { UserServices } from './services/UserServices';

import { useTranslation } from 'react-i18next';

const config = require('./config/config.json')

const AppSubmenu = (props) => {

    const [activeIndex, setActiveIndex] = useState(null)

    const onMenuItemClick = (event, item, index) => {
        if (item.disabled) {
            event.preventDefault();
            return true;
        }

        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        if (index === activeIndex)
            setActiveIndex(null);
        else
            setActiveIndex(index);

        if (props.onMenuItemClick) {
            props.onMenuItemClick({
                originalEvent: event,
                item: item
            });
        }
    }

    const onKeyDown = (event) => {
        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault();
            event.target.click();
        }
    }

    const renderLinkContent = (item) => {
        let submenuIcon = item.items && <i className="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>;
        let badge = item.badge && <Badge value={item.badge} />

        return (
            <React.Fragment>
                <i className={item.icon}></i>
                <span>{item.label}</span>
                {submenuIcon}
                {badge}
                <Ripple />
            </React.Fragment>
        );
    }

    const renderLink = (item, i) => {
        let content = renderLinkContent(item);

        if (item.to) {
            return (
                <NavLink aria-label={item.label} onKeyDown={onKeyDown} role="menuitem" className="p-ripple" activeClassName="router-link-active router-link-exact-active" to={item.to} onClick={(e) => onMenuItemClick(e, item, i)} exact target={item.target}>
                    {content}
                </NavLink>
            )
        }
        else {
            return (
                <a tabIndex="0" aria-label={item.label} onKeyDown={onKeyDown} role="menuitem" href={item.url} className="p-ripple" onClick={(e) => onMenuItemClick(e, item, i)} target={item.target}>
                    {content}
                </a>
            );
        }
    }

    let items = props.items && props.items.map((item, i) => {
        let active = activeIndex === i;
        let styleClass = classNames(item.badgeStyleClass, { 'layout-menuitem-category': props.root, 'active-menuitem': active && !item.to });

        if (props.root) {
            return (
                <li className={styleClass} key={i} role="none">
                    {props.root === true && <React.Fragment>
                        <div className="layout-menuitem-root-text" aria-label={item.label}>{item.label}</div>
                        <AppSubmenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                    </React.Fragment>}
                </li>
            );
        }
        else {
            return (
                <li className={styleClass} key={i} role="none">
                    {renderLink(item, i)}
                    <CSSTransition classNames="layout-submenu-wrapper" timeout={{ enter: 1000, exit: 450 }} in={active} unmountOnExit>
                        <AppSubmenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                    </CSSTransition>
                </li>
            );
        }
    });

    return items ? <ul className={props.className} role="menu">{items}</ul> : null;
}

export const AppMenu = (props) => {
    const { isAuthenticated } = UserServices();
    const { t } = useTranslation();

    const [menus, setMenus] = useState([]);

    useEffect(() => {
        try {
            let currentMenu = [
                {
                   
                    items: [
                       
                        { label: t("interactive_map"), icon: 'pi pi-fw pi-map', to: '/' },
                        { label: t("title"), icon: 'pi pi-fw pi-globe', to: '/knowledges' },
                    ]
                },
                {
                    label: t('useful_links'),
                    items: [
                        { label: t("official_site"), command: () => { window.location = config.patentSiteUrl }  },
                        { label: t("search_system"), command: () => { window.location = config.patentSearchSiteUrl }  },
                       
                    ]
                }
            ];
            if (isAuthenticated) {
                currentMenu.push({
                    label: t('admin_panel'),
                    items: [
                        { label: t("users"), icon: 'pi pi-fw pi-users', to: '/users' },
                        { label: t("references"), icon: 'pi pi-fw pi-book', to: '/references' },
                        { label: t("title"), icon: 'pi pi-fw pi-globe', to: '/admin_knowledges' }
                    ]
                })
            }
            setMenus(currentMenu)
        } catch { }
    }, [isAuthenticated])

    return (
        <div className="layout-menu-container">
            <AppSubmenu items={menus} className="layout-menu" onMenuItemClick={props.onMenuItemClick} root={true} role="menu" />

        </div>
    );
}
