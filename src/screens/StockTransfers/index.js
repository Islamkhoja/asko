import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Style from './Style';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';

import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import searchImg from '../../assets/images/search-normal.svg';
import filterImg from '../../assets/images/filter-search.svg';
import arrowDown from '../../assets/images/arrow-down.svg';
import pagination from '../../assets/images/pagination.svg';
import editIcon from '../../assets/images/edit-icon.svg';
import close from '../../assets/images/Close-filter.svg';
import { get } from 'lodash';
import formatterCurrency from '../../helpers/currency';
import moment from 'moment';
import { FadeLoader } from "react-spinners";
import { ConfirmModal, ErrorModal, ConfirmModalOrder, FilterOrderModal, IncomingPayment } from '../../components/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { errorNotify, successNotify, warningNotify, limitList, override, statuses } from '../../components/Helper';
import { main } from '../../store/slices';

let url = process.env.REACT_APP_API_URL



const StockTransfers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { setMe } = main.actions;

    const { setFilter } = main.actions;
    const { getMe, getFilter } = useSelector(state => state.main);

    const [showDropdown, setShowDropdown] = useState(false);
    const [limit, setLimit] = useState(get(getFilter, 'limit', 10));
    const [page, setPage] = useState(get(getFilter, 'page', 1));
    const [ts, setTs] = useState(get(getFilter, 'ts', 10));
    const [select, setSelect] = useState(get(getFilter, 'select', []))
    const [search, setSearch] = useState(get(getFilter, 'search', ''))

    const [activeData, setActiveData] = useState(get(getFilter, 'activeData', false));
    const [allPageLength, setAllPageLength] = useState(0);
    const [loading, setLoading] = useState(false)
    const [mainCheck, setMainCheck] = useState(false)
    const [mainData, setMainData] = useState([])
    const [warehouses, setWarehouses] = useState([])
    const [discountGroup, setDiscountGroup] = useState([])

    const [filterProperty, setFilterProperty] = useState(get(getFilter, 'filterProperty', {}))

    const [updateLoading, setUpdateLoading] = useState(false)

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [invoiceDropDown, setInvoiceDropDown] = useState(false);
    let [color, setColor] = useState("#3C3F47");


    const confirmRef = useRef();

    const errorRef = useRef();

    const filterRef = useRef();

    const incomingRef = useRef();

    const incomingPaymentRef = useCallback(ref => {
        incomingRef.current = ref;
    }, []);

    const filterModalRef = useCallback(ref => {
        filterRef.current = ref;
    }, []);

    const confirmModalRef = useCallback(ref => {
        confirmRef.current = ref;
    }, []);

    const getErrorRef = useCallback(ref => {
        errorRef.current = ref;
    }, []);

    const sleepNow = (delay) =>
        new Promise((resolve) => setTimeout(resolve, delay));

    const handleChange = e => {
        const newSearchTerm = e.target.value;
        setSearch(newSearchTerm);
    };

    useEffect(() => {
        dispatch(setFilter({ limit, ts, search, filterProperty, activeData }));
    }, [limit, ts, search, filterProperty, activeData])



    useEffect(() => {
        getWarehouses()
    }, [])





    useEffect(() => {
        const delay = 1000;
        let timeoutId;

        if (search) {
            timeoutId = setTimeout(() => {
                getOrders({ page: 1, limit, value: search, filterProperty })
                setTs(limit)
                setPage(1);
            }, delay);
        }
        else {
            getOrders({ page: 1, limit, filterProperty, value: search })
            setTs(limit)
            setPage(1);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [search]);

    function getWarehouses() {
        axios
            .get(
                url + `/api/warehouses`,
                {
                    headers: {
                        'Authorization': `Bearer ${get(getMe, 'token')}`,
                    }
                }
            )
            .then(({ data }) => {
                setWarehouses(data)
            })
            .catch(err => {
                if (get(err, 'response.status') == 401) {
                    navigate('/login')
                    return
                }
                errorNotify("Gruppalarni yuklashda muommo yuzaga keldi")
            });

        return;
    };

    const subQuery = (prop = {}) => {
        let docDateStart = get(prop, 'DocDate.start', {})
        let docDateEnd = get(prop, 'DocDate.end', {})
        let status = get(prop, 'status', [])
        let list = [
            { name: 'docDateStart', data: docDateStart },
            { name: 'docDateEnd', data: docDateEnd },
            { name: 'statusPay', data: status },
        ].filter(item => get(item, 'data', '').length)
        return {
            link: list.map(item => {
                return `&${get(item, 'name', '')}=${get(item, 'data', '')}`
            }).join(''), status: status.length
        }
    }


    // StockTransferDrafts(123)/Close
    async function closePurchase(body) {
        setUpdateLoading(true)
        axios
            .post(
                url + `/api/stock-transfers`,
                body,
                {
                    headers: {
                        'Authorization': `Bearer ${get(getMe, 'token')}`,
                    }
                }
            )
            .then(({ data }) => {
                setUpdateLoading(false)
                getOrders({ page: 1, limit, filterProperty, value: search })
                setTs(limit)
                setPage(1);
                successNotify("Muvaffaqiyatli qo'shildi")
            })
            .catch(err => {
                getOrders({ page: 1, limit, filterProperty, value: search })
                setTs(limit)
                setPage(1);
                setUpdateLoading(false)

                if (get(err, 'response.status') == 401) {
                    navigate('/login')
                    return
                }

                errorNotify(get(err, 'response.data.message', `Ma'lumot O'chirishda xatolik yuz berdi`) || `Ma'lumot O'chirishda xatolik yuz berdi`)
            });

        return;
    }
    async function deleteStock(doc) {
        setUpdateLoading(true)
        axios
            .delete(
                url + `/api/stock-transfers/${doc}`,
                {
                    headers: {
                        'Authorization': `Bearer ${get(getMe, 'token')}`,
                    }
                }
            )
            .then(({ data }) => {
                if (data?.status) {
                    warningNotify(get(data, 'message') || "Ma'lumot mavjud emas")
                }
                setUpdateLoading(false)
                getOrders({ page: 1, limit, filterProperty, value: search })
                setTs(limit)
                setPage(1);
                successNotify("Muvaffaqiyatli o'chirildi")
            })
            .catch(err => {
                setUpdateLoading(false)

                if (get(err, 'response.status') == 401) {
                    navigate('/login')
                    return
                }
                getOrders({ page: 1, limit, filterProperty, value: search })
                setTs(limit)
                setPage(1);
                errorNotify(get(err, 'response.data.message', `Ma'lumot O'chirishda xatolik yuz berdi`) || `Ma'lumot O'chirishda xatolik yuz berdi`)
            });

        return;
    }


    const getOrders = (pagination) => {
        setLoading(true)
        let { link } = subQuery(get(pagination, 'filterProperty', {}))
        axios
            .get(
                url + `/api/getStockTransfers?offset=${get(pagination, 'page', 1)}&limit=${get(pagination, 'limit', limit)}&status=${false}&search=${get(pagination, 'value', '').toLowerCase()}` + link,
                {
                    headers: {
                        'Authorization': `Bearer ${get(getMe, 'token')}`,
                    }
                }
            )
            .then(({ data }) => {
                setLoading(false)
                setMainData(data)
                setAllPageLength(get(data, '[0].LENGTH', 0))
                setSelect([])
            })
            .catch(err => {
                setLoading(false)

                if (get(err, 'response.status') == 401) {
                    navigate('/login')
                    return
                }

                errorNotify(get(err, 'response.data.message', `Ma'lumot yuklashda xatolik yuz berdi`) || `Ma'lumot yuklashda xatolik yuz berdi`)
            });

        return;
    };



    const filterOrders = () => {
        filterRef.current?.open(filterProperty, setFilterProperty);
    }

    let statuses = {
        2: {
            color: '#FFFFFF',
            backgroundColor: '#4caefe',
            name: 'Утверждено из офиса',
        },
        1: {
            color: '#FFFFFF',
            backgroundColor: '#FFA000',
            name: 'В ожидании',
        },
        0: {
            color: '#FFFFFF',
            backgroundColor: '#388E3C',
            name: 'Закрыто',
        },
        4: {
            color: '#FFFFFF',
            backgroundColor: '#6C757D',
            name: 'Отменить'
        },
    };

    return (
        <>

            <Style>
                <Layout>
                    <div className='container'>
                        <div className='head'>
                            <div className='left-head d-flex align'>
                                <h3 className='left-title'>
                                    Перемещение запасов
                                </h3>
                            </div>
                            <div className='right-head'>

                                <div className='right-pagination'>
                                    <p className='pagination-text'><span>{page}-{ts}</span> <span>of {allPageLength}</span> </p>
                                    <button onClick={() => {
                                        if (page > 1) {
                                            getOrders({ page: page - limit, limit, value: search, filterProperty })
                                            setPage(page - limit);
                                            setTs(ts - limit)
                                        }
                                    }} disabled={page == 1} className={`pagination-button left-pagination ${page == 1 ? 'opcity-5' : ''}`}>
                                        <img src={pagination} alt="arrow-button-pagination" />
                                    </button>

                                    <button onClick={() => {
                                        if (ts < allPageLength) {
                                            getOrders({ page: page + limit, limit, value: search, filterProperty })
                                            setPage(page + limit)
                                            setTs(limit + ts)
                                        }
                                    }} disabled={ts >= allPageLength} className={`pagination-button margin-right ${ts >= allPageLength ? 'opcity-5' : ''}`}>
                                        <img src={pagination} alt="arrow-button-pagination" />
                                    </button>
                                </div>
                                <div className='right-input'>
                                    <img className='right-input-img' src={searchImg} alt="search-img" />
                                    <input onChange={handleChange} value={search} type="search" className='right-inp' placeholder='Поиск' />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    {
                                        (Object.values(filterProperty).flat().length) ? (
                                            <button onClick={() => {
                                                setFilterProperty({})
                                                getOrders({ page: 1, limit, value: search })
                                                setPage(1)
                                                setTs(limit)
                                            }} className={`close-btn`}>
                                                <img src={close} alt="close-filter" />
                                            </button>
                                        ) : ''
                                    }

                                    <button onClick={filterOrders} className='right-filter'>
                                        <img className='right-filter-img' src={filterImg} alt="filter-img" />
                                    </button>
                                </div>

                                <div className='right-limit'>
                                    <button onClick={() => setShowDropdown(!showDropdown)} className='right-dropdown'>
                                        <p className='right-limit-text'>{limit}</p>
                                        <img src={arrowDown} className={showDropdown ? "up-arrow" : ""} alt="arrow-down-img" />
                                    </button>
                                    <ul className={`dropdown-menu ${showDropdown ? "display-b" : "display-n"}`} aria-labelledby="dropdownMenuButton1">
                                        {
                                            limitList.map((item, i) => {
                                                return (<li key={i} onClick={() => {
                                                    if (limit != item) {
                                                        setLimit(item);
                                                        setPage(1);
                                                        setShowDropdown(false);
                                                        setTs(item)
                                                        getOrders({ page: 1, limit: item, value: search, filterProperty })
                                                        setMainCheck(false)
                                                    }
                                                    return
                                                }} className={`dropdown-li ${limit == item ? 'dropdown-active' : ''}`}><a className="dropdown-item" href="#">{item}</a></li>)
                                            })
                                        }
                                    </ul>
                                </div>


                                {/* {get(getMe, 'data.U_role') == 'Salesperson' && <button onClick={() => navigate('/invoice')} className='btn-head'>
                                    Добавить
                                </button>} */}
                                {<button onClick={() => navigate('/stock-transfers-add')} className='btn-head'>
                                    Добавить
                                </button>}
                            </div>
                        </div>
                        <div className='table'>
                            <div className='table-head'>
                                <ul className='table-head-list d-flex align  justify'>
                                    <li className='table-head-item w-20'>
                                        ID
                                    </li>
                                    <li className='table-head-item w-70'>Со склада</li>
                                    <li className='table-head-item w-70'>На склад</li>
                                    <li className='table-head-item w-70'>Дата регистрации</li>
                                    <li className='table-head-item w-70'>Комментарий</li>
                                    <li className='table-head-item w-70'>Статус</li>
                                </ul>
                            </div>
                            <div className='table-body'>
                                {
                                    !loading ? (
                                        <ul className='table-body-list'>
                                            {
                                                mainData.map((item, i) => {
                                                    return (
                                                        <li key={i} className={`table-body-item ${get(item, 'ToWhsCode', '-') == get(getMe, 'data.U_branch') ? 'act' : ''} ${activeData === (i + 1) ? 'active-table' : ''}`}>
                                                            <div onClick={() => setActiveData(activeData === i + 1 ? 0 : (i + 1))} className='table-item-head d-flex align  justify'>
                                                                <div className='w-20 p-16'>
                                                                    <p className='table-body-text truncated-text w-50' title={get(item, 'DocEntry', '')} >
                                                                        {get(item, 'DocNum', '-') || '-'}
                                                                    </p>
                                                                </div>
                                                                <div className=' w-70 p-16'>
                                                                    <p className='table-body-text truncated-text' title={warehouses.find(el => el.WhsCode == get(item, 'Filler', '-'))?.WhsName} >
                                                                        {get(item, 'Filler', '-')} - {warehouses.find(el => el.WhsCode == get(item, 'Filler', '-'))?.WhsName}
                                                                    </p>
                                                                </div>
                                                                <div className='w-70 p-16'>
                                                                    <p className='table-body-text truncated-text' title={warehouses.find(el => el.WhsCode == get(item, 'ToWhsCode', '-'))?.WhsName} >
                                                                        {get(item, 'ToWhsCode', '-')} - {warehouses.find(el => el.WhsCode == get(item, 'ToWhsCode', '-'))?.WhsName}
                                                                    </p>
                                                                </div>

                                                                <div className='w-70 p-16' >
                                                                    <p className='table-body-text w-70'>
                                                                        {moment(get(item, 'DocDate', '')).format("DD.MM.YYYY")}
                                                                    </p>
                                                                </div>

                                                                <div className='w-70 p-16' >
                                                                    <p className='table-body-text w-70'>
                                                                        {get(item, 'Comments') || '-'}
                                                                    </p>
                                                                </div>

                                                                <div className='w-70 p-16' >
                                                                    {
                                                                        get(item, 'Table') !== 'ODRF' ?
                                                                            <button style={{ color: statuses['0'].color, backgroundColor: statuses['0'].backgroundColor }} className='table-body-text status-button'>
                                                                                Утверждено из филиала
                                                                            </button> : <button style={{ color: statuses[get(item, 'U_status', 'O')].color, backgroundColor: statuses[get(item, 'U_status', 'O')].backgroundColor }} className='table-body-text status-button'>
                                                                                {statuses[get(item, 'U_status', 'O')].name}
                                                                            </button>

                                                                    }

                                                                </div>

                                                            </div>
                                                            <div className={`table-item-foot d-flex align ${activeData === (i + 1) ? 'act-foot' : ''}`}>
                                                                <button className='table-item-btn d-flex align'>
                                                                    {
                                                                        <Link className='table-item-text d-flex align' to={`/stock-transfers-add/${get(item, 'DocEntry')}/${get(item, 'Table') == 'ODRF' ? 'draft' : 'doc'}`}>
                                                                            Просмотреть <img src={editIcon} alt="arrow right" />
                                                                        </Link>
                                                                    }
                                                                </button>
                                                                {
                                                                    (get(item, 'ToWhsCode') == get(getMe, 'data.U_branch')) && (get(item, 'Table') == 'ODRF') ?
                                                                        <div className="dropdown-container">
                                                                            <button disabled={get(item, 'U_status') != '2'} style={{ width: '103px' }} className={`table-item-btn d-flex align table-item-text position-relative ${get(item, 'U_status') != '2' ? 'opacity-5' : ''}`}
                                                                                onClick={() => closePurchase(item)}
                                                                            >
                                                                                Закрыть  {updateLoading ?
                                                                                    <div className="spinner-border" role="status">
                                                                                        <span className="sr-only">Loading...</span>
                                                                                    </div>
                                                                                    : <img style={{ marginLeft: '6px' }} src={editIcon} alt="arrow-right" />}
                                                                            </button>
                                                                        </div> : ''}
                                                                {
                                                                    (get(item, 'Filler') == get(getMe, 'data.U_branch')) ?
                                                                        <div className="dropdown-container">
                                                                            <button disabled={get(item, 'U_status') != '1'} style={{ width: '103px' }} className={`table-item-btn d-flex align table-item-text position-relative ${get(item, 'U_status') != '1' ? 'opacity-5' : ''}`}
                                                                                onClick={() => deleteStock(item.DocEntry)}
                                                                            >
                                                                                Удалить  {updateLoading ?
                                                                                    <div className="spinner-border" role="status">
                                                                                        <span className="sr-only">Loading...</span>
                                                                                    </div>
                                                                                    : <img style={{ marginLeft: '6px' }} src={editIcon} alt="arrow-right" />}
                                                                            </button>
                                                                        </div> : ''}
                                                            </div>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    ) : <FadeLoader color={color} loading={loading} cssOverride={override} size={100} />
                                }
                            </div>
                        </div>
                    </div>
                    {/* <div className='footer-main'>
                        <div className='footer-info'>
                            <div className="container">
                                <div className='right-head' style={{ justifyContent: 'end' }}>
                                    <div className='footer-block'>
                                        <p className='footer-text'>Сумма сделки : <span className='footer-text-spn'>{formatterCurrency(Number(get(mainData, '[0].ALLDOCTOTAL', 0)), "USD")}</span></p>
                                    </div>
                                    <div className='footer-block'>
                                        <p className='footer-text'>Куб : <span className='footer-text-spn'>{Number(get(mainData, '[0].ALLKUB', 0)).toFixed(4)}</span></p>
                                    </div>
                                    <div className='footer-block'>
                                        <p className='footer-text'>Брутто : <span className='footer-text-spn'>{Number(get(mainData, '[0].ALLBRUTTO', 0)).toFixed(4)}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </Layout>
            </Style>
            <>
                <ToastContainer />
                {/* <ConfirmModalOrder getRef={confirmModalRef} title={"Oshibka"} fn={statusChange} /> */}
                <FilterOrderModal
                    getRef={filterModalRef}
                    filterProperty={filterProperty}
                    setFilterProperty={setFilterProperty}
                    getOrders={getOrders}
                    arg={{ page: 1, limit, value: search }}
                    setPage={setPage}
                    setTs={setTs}
                    status={true}
                />
                <IncomingPayment
                    getRef={incomingPaymentRef}
                    getOrders={getOrders}
                    page={page}
                    limit={limit}
                    search={search}
                    filterProperty={filterProperty}
                />
                <ErrorModal
                    getRef={getErrorRef}
                    title={'Ошибка'}
                />
            </>
        </>
    );
};

export default StockTransfers;
