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
    const delay = 1000;
    let timeoutId;
    if (search && !customerCode) {
      timeoutId = setTimeout(() => {
        getSearchItems({ page: 1, limit: 50, value: search, filterProperty, whsCode: get(selectWh, 'WhsCode') })
      }, delay);
    }
    else {
      if (search.length == 0) {
        setBpShow(false)
      }
      setCustomerData([])
      setCustomerCode('')
      getItems({ page: 1, limit, filterProperty, whsCode: get(selectWh, 'WhsCode'), startDate, endDate })
      setTs(limit)
      setPage(1);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  const handleChange = e => {
    const newSearchTerm = e.target.value;
    setSearch(newSearchTerm);

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
    if (!get(pagination, 'item')) {
      return
    }
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
    axios
      .get(
        url + `/api/product-flow-report?item=${get(pagination, 'item', 1)}&startDate=${get(pagination, 'startDate', startDate)}&endDate=${get(pagination, 'endDate', endDate)}`,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(async ({ data }) => {
        setMainData(data)
        setLoading(false)
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







  const getSearchItems = (pagination) => {
    setLoading(true)
    axios
      .get(
        url + `/api/items?offset=${get(pagination, 'page', 1)}&status=false&search=${get(pagination, 'value', '').toLowerCase()}&limit=${get(pagination, 'limit', limit)}`,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(async ({ data }) => {
        setLoading(false)
        setBpShow(true)
        setCustomerData(
          data
        )
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



  return (
    <>
      <Style>
        <Layout>
          <div className='container'>
            <div className="order-head">
              <div style={{ marginBottom: '0px' }} className="order-main d-flex align justify">
                <div className='d-flex align'>
                  <h3 className='title-menu'> Отчет о движении товаров
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
                    <div style={{ width: '500px' }} className='right-input'>
                      <img className='right-input-img' src={searchImg} alt="search-img" />
                      <input style={{ width: '100%' }} onChange={handleChange} value={search} type="search" className='right-inp' placeholder='Поиск' />
                      {(customerData.length && bpShow) ? (
                        <ul className="dropdown-menu" style={{ top: '49px', zIndex: 1 }}>
                          {customerData.map((customerItem, i) => (
                            <li onClick={() => {
                              setBpShow(false)
                              setCustomer(get(customerItem, 'ItemName', ''))
                              setCustomerCode(get(customerItem, 'ItemCode', ''))
                              getItems({ item: get(customerItem, 'ItemCode', ''), startDate, endDate })
                              setSearch(get(customerItem, 'ItemName', ''))
                              setCustomerData([])
                            }} key={i} className={`dropdown-li`}><a className="dropdown-item" href="#">
                                {get(customerItem, 'ItemName', '') || '-'} - {get(customerItem, 'Name', '') || '-'}
                              </a></li>
                          ))}
                        </ul>
                      ) : (customerData.length == 0 && customer.length && bpShow) ? <ul className="dropdown-menu" style={{ top: '49px', zIndex: 1 }}>
                        <li onClick={() => {
                          setBpShow(false)
                        }} className={`dropdown-li`}><a className="dropdown-item" href="#">
                            {'-'}
                          </a></li>
                      </ul> : ''}
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
                  <li className='table-head-item w-50'>
                    ID
                  </li>
                  <li className='table-head-item w-70'>Дата регистрации</li>
                  <li className='table-head-item w-70'>Документ</li>
                  <li className='table-head-item w-70'>Количество</li>
                </ul>
              </div>
              <div className='table-body'>
                {
                  !loading ? (
                    <ul className='table-body-list'>
                      {
                        mainData.map((item, i) => {
                          return (
                            <LazyLoad height={65} once>
                              <li key={i} className={`table-body-item`}>
                                <div className='table-item-head d-flex align  justify'>
                                  <div className='w-50 p-16'>
                                    <p className='table-body-text' >
                                      {
                                        get(item, 'DocNum')
                                      }
                                    </p>
                                  </div>
                                  <div className='w-70 p-16'>
                                    <p className='table-body-text' >
                                      {moment(get(item, 'DocDate', '')).format('DD.MM.YYYY')}
                                    </p>
                                  </div>
                                  <div className='w-70 p-16' >
                                    <p style={{ width: "200px" }} className='table-body-text truncated-text' title={get(item, 'DocumentType', '')}>
                                      {get(item, 'DocumentType', '') || '-'}
                                    </p>
                                  </div>
                                  <div className='w-70 p-16' >
                                    <p style={{ width: "145px" }} className='table-body-text truncated-text'>
                                      {Number(get(item, 'Quantity', '')) || '-'}
                                    </p>
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