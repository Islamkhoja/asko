import React from 'react';
import Style from './Style';
import TopImage from '../../assets/images/144px.png';
import { useTranslation } from 'react-i18next';
import { get } from 'lodash';
import { Link, NavLink, useLocation } from 'react-router-dom';
import formatterCurrency from '../../helpers/currency';
import { useSelector } from 'react-redux';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { getMe } = useSelector(state => state.main);


  return (
    <Style>
      <div className="main">
        <div className='container'>
          <div className='inner-container'>
            <div className='d-flex align-items'>
              <a className='display-block' href={`${['Cashier', "SalesPerson"].includes(get(getMe, 'data.U_role')) ? '/home' : '/warehouse-balance-report-crm'}`}>
                <img width={114} height={32} src={TopImage} alt="top logo" className="topLogo" />
              </a>
              <nav className='navbar'>
                <ul className='d-flex align-items list'>
                  {
                    ['Cashier', "SalesPerson"].includes(get(getMe, 'data.U_role')) && (
                      <>
                        <li className='list-item'>
                          <NavLink
                            to="/home"
                            className={() => {
                              const isActive = location.pathname === '/home' || location.pathname.startsWith('/order') || location.pathname.startsWith('/invoice');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >

                            Продажа
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/outgoing"
                            className={() => {
                              const isActive = location.pathname.startsWith('/outgoing') || location.pathname.startsWith('/payment');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Исходящий платеж
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/purchase-request"
                            className={() => {
                              const isActive = location.pathname.includes('/purchase-request')
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Заявка на закупку
                          </NavLink>
                        </li>

                        <li className='list-item'>
                          <NavLink
                            to="/stock-transfers"
                            className={() => {
                              const isActive = location.pathname.startsWith('/stock-transfers')
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Перемещение запасов
                          </NavLink>
                        </li>

                        <li className='list-item'>
                          <NavLink
                            to="/cash-report"
                            className={() => {
                              const isActive = location.pathname.startsWith('/cash-report');

                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Кассовый отчет
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/warehouse-balance-report"
                            className={() => {
                              const isActive = location.pathname == '/warehouse-balance-report'
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Отчет склад остатка
                          </NavLink>
                        </li>


                        <li className='list-item'>
                          <NavLink
                            to="/warehouse-without-movement"
                            className={() => {
                              const isActive = location.pathname.includes('/warehouse-without-movement');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Отчет без движение
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/report-sales-analysis"
                            className={() => {
                              const isActive = location.pathname.includes('/report-sales-analysis');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Касса отчет анализ продаж
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/product-flow-report"
                            className={() => {
                              const isActive = location.pathname.includes('/product-flow-report');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Отчет о движении товаров
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/purchase-return"
                            className={() => {
                              const isActive = location.pathname.includes('/purchase-return');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Заявка на возврат
                          </NavLink>
                        </li>
                        <li className='list-item'>
                          <NavLink
                            to="/price-print"
                            className={() => {
                              const isActive = location.pathname.includes('/price-print');
                              return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                            }}
                          >
                            Цена печати
                          </NavLink>
                        </li>
                      </>
                    )
                  }
                  {
                    ["CallCenter"].includes(get(getMe, 'data.U_role')) && (

                      <li className='list-item'>
                        <NavLink
                          to="/warehouse-balance-report-crm"
                          className={() => {
                            const isActive = location.pathname.includes('/warehouse-balance-report-crm');
                            return `list-item-link ${isActive ? 'opacity-1' : ''}`;
                          }}
                        >
                          Отчет CRM остатка
                        </NavLink>
                      </li>
                    )
                  }
                </ul>

              </nav>
            </div>

            <div className='df'>
              <div className='right-head' style={{ justifyContent: 'space-between', marginRight: '20px' }}>
                <div className='footer-block' style={{ background: "#F7F8F9" }}>
                  <p className='footer-text'>Курс доллара: <span className='footer-text-spn'>
                    {
                      (formatterCurrency(Number(get(getMe, 'currency.Rate', 1) || 1), 'UZS'))
                    }</span></p>
                </div>
              </div>
              <div className='left-side df'>
                <span className='circle'>{get(getMe, 'data.U_branch', '') || ''}</span>
                <p className='textMain'>{get(getMe, 'data.SlpName', '') || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </Style>
  );
};

export default Header;
