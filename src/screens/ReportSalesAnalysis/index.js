import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useParams, useLocation } from 'react-router-dom';
import Style from './Style';
import { useNavigate } from 'react-router-dom';
import searchImg from '../../assets/images/search-normal.svg';
import analysitic from '../../assets/images/analysitic.svg';
import filterImg from '../../assets/images/filter-search.svg';
import arrowDown from '../../assets/images/arrow-down.svg';
import pagination from '../../assets/images/pagination.svg';
import analytics from '../../assets/images/market_5700162.png';
import tickSquare from '../../assets/images/tick-square.svg';
import imageIcon from '../../assets/images/image.svg';
import add from '../../assets/images/add.svg';
import close from '../../assets/images/Close-filter.svg';
import axios from 'axios';
import { get, isNumber } from 'lodash';
import formatterCurrency from '../../helpers/currency';
import { FadeLoader } from "react-spinners";
import LazyLoad from "react-lazyload";
import { ErrorModal, ConfirmModal, FilterModal, WarningModal, BusinessPartner, ImageModal, FilterModalReport, ReportSalesAnalysisChart, ReportSalesAnalysisChartDaily } from '../../components/Modal';
import { Spinner } from '../../components';
import { useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { limitList, errorNotify, warningNotify, successNotify } from '../../components/Helper';
import moment from 'moment';
import rightButton from '../../assets/images/right.svg';
import { validate } from 'uuid';
import { exportTableToExcel } from './excel';

let url = process.env.REACT_APP_API_URL

const override = {
  position: "absolute",
  left: "50%",
  top: "50%",
};

let merchants = {
  '01': "UZUM X12",
  '02': "UZUM X6",
  '03': "PAYME NASIYA",
  '04': "ALIF X6 X12",
  '05': "ZOOD X12",
  '06': "ZOOD X6",
  '07': "UZUM X3",
  '08': "ZOOD X4"
}
const WarehouseBalanceReport = () => {
  const { getMe } = useSelector(state => state.main);

  let { id } = useParams();
  let location = useLocation();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([])
  const [whShow, setWhShow] = useState(false)
  const [selectWh, setSelectWh] = useState({})
  let [color, setColor] = useState("#3C3F47");
  const [showDropdown, setShowDropdown] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [allPageLength, setAllPageLength] = useState(0);
  const [ts, setTs] = useState(10);
  const [loading, setLoading] = useState(false)
  const [mainData, setMainData] = useState([])
  const [search, setSearch] = useState('')
  const [state, setState] = useState([])
  const [allPageLengthSelect, setAllPageLengthSelect] = useState(state.length);
  const [actualData, setActualData] = useState([])
  const [isEmpty, setIsEmpty] = useState(false)
  const [bpShow, setBpShow] = useState(false)
  const [customer, setCustomer] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [customerData, setCustomerData] = useState([])
  const [whereKnow, setWhereKnow] = useState([])
  const [region, setRegion] = useState([])
  const [customerDataInvoice, setCustomerDataInvoice] = useState({})
  const [orderLoading, setOrderLoading] = useState(false)
  const [date, setDate] = useState({ DocDate: moment().format("YYYY-MM-DD"), DocDueDate: moment().format("YYYY-MM-DD") })
  const [limitSelect, setLimitSelect] = useState(10);
  const [pageSelect, setPageSelect] = useState(1);
  const [tsSelect, setTsSelect] = useState(10);
  const [clone, setClone] = useState([]);
  const [docEntry, setDocEntry] = useState({
    id,
    status: false,
  });

  const [orderStatus, setOrderStatus] = useState('1')

  const [salesPersonList, setSalesPersonList] = useState([
    { SlpCode: -1, SlpName: "Нет" }])


  const [showDropDownSalesPerson, setShowDropdownSalesPerson] = useState(false)
  const [salesPerson, setSalesPerson] = useState('Нет')
  const [salesPersonCode, setSalesPersonCode] = useState(-1)

  const [showDropDownStatus, setShowDropdownStatus] = useState(false)
  const [showDropDownMerchant, setShowDropdownMerchant] = useState(false)
  const [comment, setComment] = useState('')
  const [logist, setLogist] = useState()

  const [filterData, setFilterData] = useState([])
  const [groups, setGroups] = useState([])

  const [merchantList, setMerchantList] = useState([])
  const [provincy, setProvincy] = useState([])
  const [carBrandList, setCarBrandList] = useState([])
  const [carBrandListName, setCarBrandListName] = useState([])

  const [filterProperty, setFilterProperty] = useState({})
  const [filterPropertyResize, setFilterPropertyResize] = useState({})


  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Oyni 2 xonali formatga keltiramiz
      const day = String(date.getDate()).padStart(2, '0'); // Kunni 2 xonali formatga keltiramiz
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));

  }, [])


  const errorRef = useRef();
  const warningRef = useRef();
  const confirmRef = useRef();

  const filterRef = useRef();
  const anaylsisRef = useRef();
  const businessPartner = useRef();
  const imageRef = useRef();

  const analysisDailyRef = useRef();


  const BusinessPartnerModalRef = useCallback(ref => {
    businessPartner.current = ref;
  }, []);



  const ImageModalRef = useCallback(ref => {
    imageRef.current = ref;
  }, []);

  const filterModalRef = useCallback(ref => {
    filterRef.current = ref;
  }, []);
  const analysisModalRef = useCallback(ref => {
    anaylsisRef.current = ref;
  }, []);
  const analysisDailyModalRef = useCallback(ref => {
    analysisDailyRef.current = ref;
  }, []);

  const getErrorRef = useCallback(ref => {
    errorRef.current = ref;
  }, []);

  const getWarningRef = useCallback(ref => {
    warningRef.current = ref;
  }, []);

  const confirmModalRef = useCallback(ref => {
    confirmRef.current = ref;
  }, []);

  const filterOrders = () => {
    filterRef.current?.open(filterData);
  }


  useEffect(() => {
    getUfd()

    getMerchant()

  }, []);



  const getUfd = () => {
    axios
      .get(
        url + `/api/getUFD`,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        setWhereKnow(data.filter(item => item.TableID == 'OCRD' && item.FieldID == 0))
        setRegion(data.filter(item => item.TableID == 'OCRD' && item.FieldID == 3))
        setProvincy(data.filter(item => item.TableID == 'OCRD' && item.FieldID == 4))
        setCarBrandList(data.filter(item => item.TableID == '@CARCODE' && item.FieldID == 4))
        setCarBrandListName(data.filter(item => item.TableID == '@CARCODE' && item.FieldID == 3))
      })
      .catch(err => {
        errorNotify(`UDF yuklashda muomo yuzaga keldi`)
      });

    return;
  }

  useEffect(() => {
    const delay = 1000;
    let timeoutId;
    if (search) {
      timeoutId = setTimeout(() => {
        getItems({ page: 1, limit, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
        setTs(limit)
        setPage(1);
      }, delay);
    }
    else {
      getItems({ page: 1, limit, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
      setTs(limit)
      setPage(1);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    const delay = 1000;
    let timeoutId;
    if (customer.length && !customerCode) {
      timeoutId = setTimeout(() => {
        getCustomer({ customer })
      }, delay);
    }
    else {
      if (customer.length == 0) {
        setBpShow(false)
      }
      setCustomerData([])
      if (!get(docEntry, 'id')) {
        // setCustomerDataInvoice({
        //   selectMerchantId: get(customerDataInvoice, 'selectMerchantId'),
        //   selectMarchantFoiz: get(customerDataInvoice, 'selectMarchantFoiz'),
        //   U_schot: get(customerDataInvoice, 'U_schot'),
        // })
      }
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [customer]);

  const handleChange = e => {
    const newSearchTerm = e.target.value;
    setSearch(newSearchTerm);
  };






  const getCustomer = (customerDataObj) => {
    axios
      .get(
        url + `/api/business-partner?search=${get(customerDataObj, 'customer', '').toLowerCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        setBpShow(true)
        setCustomerData(
          data
        )
      })
      .catch(err => {
        setBpShow(false)

        errorNotify("Mijozlarni yuklashda muommo yuzaga keldi")
      });

    return;
  };


  function roundMiddle(number) {
    return Math.round(number / 1000) * 1000;
  }



  const getOrderByDocEntry = (doc) => {
    let link = `/api/draft/${doc}`
    return axios
      .get(
        url + link,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        return data
      })
      .catch(err => {
        errorNotify("Buyurtmani yuklashda muommo yuzaga keldi")
        setLoading(false)
        if (get(err, 'response.status') == 401) {
          navigate('/login')
          return
        }
      });

    return;
  };






  const getItems = (pagination) => {

    if (!get(pagination, 'startDate', startDate) || !get(pagination, 'endDate', endDate)) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Oyni 2 xonali formatga keltiramiz
        const day = String(date.getDate()).padStart(2, '0'); // Kunni 2 xonali formatga keltiramiz
        return `${year}-${month}-${day}`;
      };

      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));

      pagination = { ...pagination, startDate: formatDate(firstDay), endDate: formatDate(lastDay) }
    }

    setLoading(true)
    let { link } = subQuery(get(pagination, 'filterProperty', {}))
    axios
      .get(
        url + `/api/report-sales-analysis?offset=${get(pagination, 'page', 1)}&startDate=${get(pagination, 'startDate', startDate)}&endDate=${get(pagination, 'endDate', endDate)}&status=false&U_branch=${get(pagination, 'whsCode', get(getMe, 'data.U_branch'))}&limit=${get(pagination, 'limit', limit)}&search=${get(pagination, 'value', '').toLowerCase()}&items=${actualData.map(item => `'${item.ItemCode}'`)}` + link,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(async ({ data }) => {
        if (get(docEntry, 'id') && !get(docEntry, 'status')) {
          getOrderByDocEntry(get(docEntry, 'id', 0)).then(async orderData => {
            let marchants = []
            if (merchantList.length == 0) {
              marchants = await getMerchant()
            }
            else {
              marchants = merchantList
            }

            setDocEntry({ ...docEntry, status: true })

            setLoading(false)
            setCustomer(get(orderData, 'CardName', ''))
            setCustomerCode(get(orderData, 'CardCode', ''))
            setCustomerDataInvoice({
              ...get(orderData, 'customer'),
              selectCar: orderData.U_car,
              selectCarName: orderData?.U_markamashina,
              selectMerchantId: get(orderData, 'U_merchantturi'),
              selectMarchantFoiz: get(orderData, 'U_merchantfoizi'),
              U_schot: get(orderData, 'U_schot')
            })
            setCustomerData([{ CardCode: get(orderData, 'CardCode', ''), CardName: get(orderData, 'CardName', '') }])
            setSalesPerson(get(orderData, 'SLP'))
            setSalesPersonCode(get(orderData, 'SlpCode'))
            setComment(get(orderData, 'Comments'))

            setDate({
              DocDate: moment(get(orderData, 'DocDate', '')).format("YYYY-MM-DD"),
              DocDueDate: moment(get(orderData, 'DocDueDate', '')).format("YYYY-MM-DD")
            })
            setAllPageLengthSelect(orderData.Items.length)
            setAllPageLength(get(data, '[0].LENGTH', 0) - orderData.Items.length)

            setMainData(data.map(item => {
              return { ...item, value: '', Discount: '', PriceList: { ...item.PriceList, Price: roundMiddle(Number(get(item, 'PriceList.Price', 0)) * get(getMe, 'currency.Rate')) } }
            }).filter(el => !orderData.Items.map(item => item.ItemCode).includes(get(el, 'ItemCode'))))
            setClone(data.map(item => {
              return { ...item, value: '', Discount: '', PriceList: { ...item.PriceList, Price: roundMiddle(Number(get(item, 'PriceList.Price', 0)) * get(getMe, 'currency.Rate')) } }
            }).filter(el => !orderData.Items.map(item => item.ItemCode).includes(get(el, 'ItemCode'))))

            setState(orderData.Items.map(item => {
              return { ...item, value: Number(item.Quantity).toString() }
            }).map(el => {
              return {
                ...el, PriceList: {
                  ...el.PriceList, Price: roundMiddle(
                    roundMiddle(Number(el.PriceList.Price || 1) * get(getMe, 'currency.Rate', 0)) +
                    roundMiddle(((el.PriceList.Price || 1) * get(getMe, 'currency.Rate')) * (get(orderData, 'U_merchantfoizi', 1) || 1) / 100))
                }
              }
            }))


            setActualData(orderData.Items.map(item => {
              return { ...item, value: Number(item.Quantity).toString(), PriceList: { ...item.PriceList, Price: roundMiddle(Number(item.PriceList.Price || 0) * get(getMe, 'currency.Rate')) } }
            }))

          })
        }
        else {
          setLoading(false)
          setMainData(data.map(item => {
            return { ...item, value: '', Discount: '', PriceList: { ...item.PriceList, Price: roundMiddle(Number(get(item, 'PriceList.Price', 0)) * get(getMe, 'currency.Rate')) } }
          }))
          setClone(data.map(item => {
            return { ...item, value: '', Discount: '', PriceList: { ...item.PriceList, Price: roundMiddle(Number(get(item, 'PriceList.Price', 0)) * get(getMe, 'currency.Rate')) } }
          }))
          setAllPageLength(get(data, '[0].LENGTH', 0))

        }
        if (groups.length == 0) {
          getGroups()
        }
        if (warehouses.length == 0) {
          getWarehouses()
        }
      })
      .catch(err => {
        if (get(err, 'response.status') == 401) {
          navigate('/login')
          return
        }
        setLoading(false)
        errorNotify("Tovarlarni yuklashda muommo yuzaga keldi")
      });

    return;
  };

  function getGroups() {
    axios
      .get(
        url + `/api/group`,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        setGroups(data)
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

  function getMerchant() {
    axios
      .get(
        url + `/api/getMerchant`,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        setMerchantList(data)

        let marchants = data
        let naqd = marchants.find(item => item.U_merchant.toLowerCase() == (get(customerDataInvoice, 'selectMerchantId', 'naqd') || 'naqd').toLowerCase() && item.U_status == '01')
        if (naqd && !get(docEntry, 'id')) {
          setCustomerDataInvoice({
            ...customerDataInvoice,
            selectMerchantId: naqd.U_merchant, selectMarchantFoiz: naqd.U_Foiz, U_schot: naqd.U_schot
          })
        }
        return data
      })
      .catch(err => {
        errorNotify("Tovarlarni yuklashda muommo yuzaga keldi")
      });

    ;
  };


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
        if (data.length) {
          setSelectWh({ WhsCode: get(getMe, 'data.U_branch'), WhsName: data.find(el => el.WhsCode == get(getMe, 'data.U_branch'))?.WhsName })
        }

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
    let group = get(prop, 'Group', '')
    let category = get(prop, 'CategoryCode', '').toString()
    let groupCode = get(prop, 'GroupCode', '').toString()

    let list = [
      { name: 'group', data: group },
      { name: 'code', data: groupCode },
      { name: 'category', data: category },
    ].filter(item => get(item, 'data', '').length)

    return {
      link: list.map(item => {
        return `&${get(item, 'name', '')}=${get(item, 'data', '')}`
      }).join(''), status: list.length
    }
  }

  const inputRefs = useRef([]);


  const handleScroll = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Style>
        <Layout>
          <div className='container'>
            <div className="order-head">
              <div style={{ marginBottom: '0px' }} className="order-main d-flex align justify">
                <div className='d-flex align'>
                  <h3 className='title-menu'> Касса отчет анализ продаж
                  </h3>

                </div>

                <div className='d-flex align justify'>
                  <div className='right-head order-head-filter'>
                    <div className='right-pagination'>
                      <p className='pagination-text'><span>{page}-{ts}</span> <span>of {allPageLength}</span> </p>
                      <button onClick={() => {
                        if (page > 1) {
                          getItems({ page: page - limit, limit, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
                          setPage(page - limit);
                          setTs(ts - limit)
                        }
                      }} disabled={page == 1} className={`pagination-button left-pagination ${page == 1 ? 'opcity-5' : ''}`}>
                        <img src={pagination} alt="arrow-button-pagination" />
                      </button>

                      <button onClick={() => {
                        if (ts < allPageLength) {
                          getItems({ page: page + limit, limit, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
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
                        (get(subQuery(filterProperty), 'status') && get(filterProperty, 'click')) ? (
                          <button onClick={() => {
                            setFilterProperty({})
                            getItems({ page: 1, limit, value: search, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
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
                      <ul style={{ zIndex: 1 }} className={`dropdown-menu ${showDropdown ? "display-b" : "display-n"}`} aria-labelledby="dropdownMenuButton1">
                        {
                          limitList.map((item, i) => {
                            return (<li key={i} onClick={() => {
                              if (limit != item) {
                                setLimit(item);
                                setPage(1);
                                setShowDropdown(false);
                                setTs(item)
                                getItems({ page: 1, limit: item, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
                              }
                              return
                            }} className={`dropdown-li ${limit == item ? 'dropdown-active' : ''}`}><a className="dropdown-item" href="#">{item}</a></li>)
                          })
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }} className='d-flex align'>
                <button style={{ marginRight: '20px' }} className='right-dropdown' onClick={() => {
                  anaylsisRef.current?.open(clone, groups);
                }} >
                  <img style={{ marginLeft: '-7px' }} src={analysitic} width={20} height={20} alt="" />
                  Analysis
                </button>
                <div className='right-limit'>
                  <button disabled={get(docEntry, 'id')} style={{ width: "200px" }} onClick={() => setWhShow(!whShow)} className='right-dropdown'>
                    <p className='right-limit-text'>{get(selectWh, 'WhsCode')} - {get(selectWh, 'WhsName')}</p>
                    <img src={arrowDown} className={whShow ? "up-arrow" : ""} alt="arrow-down-img" />
                  </button>

                  <ul style={{ zIndex: 1 }} className={`dropdown-menu ${whShow ? "display-b" : "display-n"}`} aria-labelledby="dropdownMenuButton1">
                    {
                      [...warehouses].map((item, i) => {
                        return (<li key={i} onClick={() => {
                          if (get(selectWh, 'WhsCode') != item.WhsCode) {
                            setWhShow(false);
                            setSelectWh(item)
                            getItems({ page, limit, value: search, filterProperty, whsCode: item.WhsCode, startDate, endDate })
                          }
                          return
                        }} className={`dropdown-li ${get(selectWh, 'WhsCode') == item.WhsCode ? 'dropdown-active' : ''}`}><a className="dropdown-item" href="#">{get(item, 'WhsCode')} - {get(item, 'WhsName')}</a></li>)
                      })
                    }
                  </ul>
                </div>


                <div className='filter-manager' style={{ width: '410px', marginLeft: '20px' }}>
                  <div className='d-flex align justify'>
                    <input
                      style={{ width: '48%', height: '36px' }}
                      className='filter-inp'
                      type="date"
                      id='start-date'
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        getItems({ page, limit, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate: e.target.value, endDate })
                      }}
                    />
                    <input
                      style={{ width: '48%', height: '36px' }}
                      className='filter-inp'
                      type="date"
                      id='end-date'
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        getItems({ page, limit, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate: e.target.value })
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
            <div className='table' >
              <div className='table-head'>
                <ul className='table-head-list d-flex align  justify'>
                  <li className='table-head-item w-50'>Склад</li>
                  <li className='table-head-item w-30'>Код</li>
                  <li className='table-head-item w-70'>Продукция</li>
                  <li className='table-head-item w-50'>Бранд</li>
                  <li className='table-head-item w-30'>Мера</li>
                  <li className='table-head-item w-30'>Остаток</li>
                  <li className='table-head-item w-30'>Количество</li>
                  <li className='table-head-item w-20'>Фото</li>
                  <li className='table-head-item w-20'>Analytics</li>
                </ul>
              </div>
              <div className='table-body'>
                {
                  !loading ? (
                    <ul className='table-body-list'>
                      {
                        clone.map((item, i) => {
                          return (
                            <LazyLoad height={65} once>
                              <li key={i} className={`table-body-item`}>
                                <div className='table-item-head d-flex align  justify'>
                                  <div className='w-50 p-16'>
                                    <p className='table-body-text' >
                                      {
                                        get(item, 'OnHand.ListName', '')} - {
                                        warehouses.find(el => get(el, 'WhsCode') == get(item, 'OnHand.ListName', ''))?.WhsName
                                      }
                                    </p>
                                  </div>
                                  <div className='w-30 p-16'>
                                    <p className='table-body-text' >
                                      {get(item, 'ItemCode', '')}
                                    </p>
                                  </div>
                                  <div className='w-70 p-16' >
                                    <p style={{ width: "200px" }} className='table-body-text truncated-text' title={get(item, 'ItemName', '')}>
                                      {get(item, 'ItemName', '') || '-'}
                                    </p>
                                  </div>
                                  <div className='w-50 p-16' >
                                    <p style={{ width: "145px" }} className='table-body-text truncated-text' title={get(item, 'ItemName', '')}>
                                      {get(item, 'Name', '') || '-'}
                                    </p>
                                  </div>
                                  <div className='w-30 p-16' >
                                    <p className='table-body-text truncated-text' title={get(item, 'ItemName', '')}>
                                      {get(item, 'U_Article', '') || '-'}
                                    </p>
                                  </div>

                                  <div className='w-30 p-16' >
                                    <p className='table-body-text '>
                                      {Number(get(item, 'OnHand.OnHand', ''))} шт
                                    </p>
                                  </div>
                                  <div className='w-30 p-16' >
                                    <p className='table-body-text '>
                                      {Number(get(item, 'Quantity', 0) || 0)} шт
                                    </p>
                                  </div>
                                  <div className='w-20 p-16' >
                                    <button style={{ cursor: 'pointer' }} onClick={() => {
                                      imageRef.current?.open({ item });
                                    }} className='btn-businesPartner'>
                                      <img src={imageIcon} width={26} height={26} alt="" />
                                    </button>
                                  </div>
                                  <div className='w-20 p-16' >
                                    <button style={{ cursor: 'pointer' }} onClick={() => {
                                      analysisDailyRef.current?.open({ item });
                                    }} className='btn-businesPartner'>
                                      <img src={analytics} width={26} height={26} alt="" />

                                    </button>
                                  </div>
                                </div>
                              </li>
                            </LazyLoad>
                          )
                        })
                      }
                    </ul>) :
                    <FadeLoader color={color} loading={loading} cssOverride={override} size={100} />
                }
              </div>
            </div>
          </div>

        </Layout>
      </Style>
      <>
        <ToastContainer />
        <FilterModalReport
          getRef={filterModalRef}
          filterProperty={filterProperty}
          setFilterProperty={setFilterProperty}
          getItems={getItems}
          arg={{ page: 1, limit, value: search, whsCode: get(selectWh, 'WhsCode'), startDate, endDate }}
          setPage={setPage}
          setTs={setTs}
          groups={groups}
        />
        <ReportSalesAnalysisChart
          getRef={analysisModalRef}
        />
        <ReportSalesAnalysisChartDaily
          getRef={analysisDailyModalRef}
        />
        <ImageModal
          getRef={ImageModalRef}
        />
        <ErrorModal
          getRef={getErrorRef}
          title={'Ошибка'}
        />
        <WarningModal
          getRef={getWarningRef}
          title={'Ошибка'}
        />
      </>
    </>
  );
};

export default WarehouseBalanceReport;