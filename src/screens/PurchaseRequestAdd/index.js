import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useParams, useLocation } from 'react-router-dom';
import Style from './Style';
import { useNavigate } from 'react-router-dom';
import searchImg from '../../assets/images/search-normal.svg';
import filterImg from '../../assets/images/filter-search.svg';
import arrowDown from '../../assets/images/arrow-down.svg';
import pagination from '../../assets/images/pagination.svg';
import tickSquare from '../../assets/images/tick-square.svg';
import imageIcon from '../../assets/images/image.svg';
import add from '../../assets/images/add.svg';
import close from '../../assets/images/Close-filter.svg';
import axios from 'axios';
import { get, isNumber } from 'lodash';
import formatterCurrency from '../../helpers/currency';
import { FadeLoader } from "react-spinners";
import LazyLoad from "react-lazyload";
import { ErrorModal, ConfirmModal, FilterModal, FilterModalResizable, WarningModal, BusinessPartner, ImageModal } from '../../components/Modal';
import { Spinner } from '../../components';
import { useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { limitList, errorNotify, warningNotify, successNotify } from '../../components/Helper';
import 'react-resizable/css/styles.css';
import Resizable from './Resizable';
import moment from 'moment';
import rightButton from '../../assets/images/right.svg';
import { validate } from 'uuid';

let url = process.env.REACT_APP_API_URL

const override = {
  position: "absolute",
  left: "50%",
  top: "50%",
};


const Order = () => {
  const { getMe } = useSelector(state => state.main);

  let { id } = useParams();
  let location = useLocation();
  const navigate = useNavigate();

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
  const [date, setDate] = useState({ DocDate: moment().format("YYYY-MM-DD"), ReqDate: moment().format("YYYY-MM-DD") })
  const [limitSelect, setLimitSelect] = useState(10);
  const [pageSelect, setPageSelect] = useState(1);
  const [tsSelect, setTsSelect] = useState(10);
  const [docEntry, setDocEntry] = useState({
    id,
    status: false,
  });


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

  const errorRef = useRef();
  const warningRef = useRef();
  const confirmRef = useRef();

  const filterRef = useRef();
  const businessPartner = useRef();
  const imageRef = useRef();


  const BusinessPartnerModalRef = useCallback(ref => {
    businessPartner.current = ref;
  }, []);



  const ImageModalRef = useCallback(ref => {
    imageRef.current = ref;
  }, []);

  const filterModalRef = useCallback(ref => {
    filterRef.current = ref;
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
    if (search) {
      timeoutId = setTimeout(() => {
        getItems({ page: 1, limit, value: search, filterProperty })
        setTs(limit)
        setPage(1);
      }, delay);
    }
    else {
      getItems({ page: 1, limit, filterProperty })
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
    let link = `/api/purchase-requests/${doc}`
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
    setLoading(true)
    let { link } = subQuery(get(pagination, 'filterProperty', {}))
    axios
      .get(
        url + `/api/items?offset=${get(pagination, 'page', 1)}&status=false&limit=${get(pagination, 'limit', limit)}&search=${get(pagination, 'value', '').toLowerCase()}&items=${actualData.map(item => `'${item.ItemCode}'`)}` + link,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(async ({ data }) => {
        if (get(docEntry, 'id') && !get(docEntry, 'status')) {
          getOrderByDocEntry(get(docEntry, 'id', 0)).then(async orderData => {


            setDocEntry({ ...docEntry, status: true })

            setLoading(false)
            setComment(get(orderData, 'Comments'))

            setDate({
              DocDate: moment(get(orderData, 'DocDate', '')).format("YYYY-MM-DD"),
              ReqDate: moment(get(orderData, 'ReqDate', '')).format("YYYY-MM-DD")
            })

            setAllPageLengthSelect(orderData.Items.length)
            setAllPageLength(get(data, '[0].LENGTH', 0) - orderData.Items.length)

            setMainData(data.map(item => {
              return { ...item, value: '' }
            }).filter(el => !orderData.Items.map(item => item.ItemCode).includes(get(el, 'ItemCode'))))

            setState(orderData.Items.map(item => {
              return { ...item, value: Number(item.Quantity).toString() }
            }))

            setActualData(orderData.Items.map(item => {
              return { ...item, value: Number(item.Quantity).toString() }
            }))

          })
        }
        else {
          setLoading(false)
          setMainData(data.map(item => {
            return { ...item, value: '', Discount: '', PriceList: { ...item.PriceList, Price: roundMiddle(Number(get(item, 'PriceList.Price', 0)) * get(getMe, 'currency.Rate')) } }
          }))
          setAllPageLength(get(data, '[0].LENGTH', 0))

        }
        if (groups.length == 0) {
          getGroups()
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




  const addState = (item) => {
    setAllPageLengthSelect(allPageLengthSelect + 1)
    setAllPageLength(allPageLength - 1)
    setMainData(mainData.filter(el => get(el, 'ItemCode', '') !== get(item, 'ItemCode', '')))
    setState([{ ...item, PriceList: { ...item.PriceList, Price: roundMiddle(Number(item.PriceList.Price || 0) + ((item.PriceList.Price || 0) * (get(customerDataInvoice, 'selectMarchantFoiz', 0) || 0) / 100)) } }, ...state])
    setActualData([item, ...actualData])
  }



  const changeValue = (value, itemCode) => {
    let index = mainData.findIndex(el => get(el, 'ItemCode', '') == itemCode)
    if (index >= 0) {
      mainData[index].value = value
      setMainData([...mainData])
    }
  }



  const postOrder = async (status) => {
    if (actualData.length == 0) {
      warningNotify("Ma'lumot mavjud emas")
      return
    }
    if (actualData.find(item => item.value.length == 0) || actualData.find(item => Number(item.value) < 0)) {
      warningNotify("Miqdor yozilmagan")
      setIsEmpty(true)
      return
    }
    setIsEmpty(false)
    confirmRef.current?.open(`Вы уверены, что хотите это ${get(docEntry, 'id', 0) ? 'обновить' : 'добавить'} ? `);
  }

  const Orders = async () => {
    let link = '/api/PurchaseRequests'
    setOrderLoading(true)
    let mapped = actualData
    let schema = {
      "DocDate": get(date, 'DocDate'),
      "RequriedDate": get(date, 'ReqDate'),
      "Comments": comment,
      "U_branch": get(getMe, 'data.U_branch'),
      "DocumentLines": mapped.map(item => {
        let obj = {
          "ItemCode": get(item, 'ItemCode', ''),
          "Dscription": get(item, 'ItemName', ''),
          "Quantity": Number(get(item, 'value', 0)),
          "WarehouseCode": get(getMe, 'data.U_branch'),
          "ItmsGrpCod": get(item, 'ItmsGrpCod')
        }
        return obj
      })
    }


    let body = schema
    axios
      .post(
        url + link,
        body,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        setCustomer('')
        setCustomerCode('')
        setOrderLoading(false)
        successNotify()
        setMainData([...actualData, ...mainData].map(item => {
          return { ...item, value: '', }
        }))
        setState([])
        setActualData([])
        setAllPageLength(allPageLength + actualData.length)
        setAllPageLengthSelect(0)
        setLimitSelect(10)
        setPageSelect(1)
        setTsSelect(10)
        setComment('')
        setLogist()
        setCustomerDataInvoice({})
      })
      .catch(err => {
        if (get(err, 'response.status') == 401) {
          navigate('/login')
          return
        }
        setOrderLoading(false)
        errorRef.current?.open(get(err, 'response.data.error.message.value', 'Ошибка'));
      });

    return;
  };

  const Update = () => {
    let link = `/api/PurchaseRequests/${get(docEntry, 'id', 0)}`
    let mapped = actualData
    let schema = {
      "DocDate": get(date, 'DocDate'),
      "RequriedDate": get(date, 'DocDueDate'),
      "Comments": comment,
      "U_branch": get(getMe, 'data.U_branch'),
      "DocumentLines": mapped.map(item => {
        let obj = {
          "ItemCode": get(item, 'ItemCode', ''),
          "Dscription": get(item, 'ItemName', ''),
          "Quantity": Number(get(item, 'value', 0)),
          "WarehouseCode": get(getMe, 'data.U_branch'),
          "ItmsGrpCod": get(item, 'ItmsGrpCod')
        }
        return obj
      })
    }

    let body = schema
    setOrderLoading(true)
    axios
      .put(
        url + link,
        body,
        {
          headers: {
            'Authorization': `Bearer ${get(getMe, 'token')}`,
          }
        }
      )
      .then(({ data }) => {
        setOrderLoading(false)
        successNotify("Ma'lumot muvaffaqiyatli o'zgartirildi")
      })
      .catch(err => {
        if (get(err, 'response.status') == 401) {
          navigate('/login')
          return
        }
        setOrderLoading(false)
        errorRef.current?.open(get(err, 'response.data.error.message.value', 'Ошибка'));
      });
  }

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



  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault(); // ArrowDown tugmasining default harakatini to'xtatish
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
        setTimeout(() => {
          const nextInput = inputRefs.current[index + 1];
          if (nextInput.type === 'number') {
            const value = nextInput.value; // Hozirgi qiymatini saqlab qo'yamiz
            nextInput.type = 'text'; // Vaqtinchalik text turiga o'zgartirish
            nextInput.setSelectionRange(value.length, value.length);
            nextInput.type = 'number'; // Qayta number turiga o'zgartirish
            nextInput.value = value; // Qiymatini qaytarish
          }
        }, 0);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); // ArrowUp tugmasining default harakatini to'xtatish
      if (index > 0) {
        inputRefs.current[index - 1].focus();
        setTimeout(() => {
          const prevInput = inputRefs.current[index - 1];
          if (prevInput.type === 'number') {
            const value = prevInput.value; // Hozirgi qiymatini saqlab qo'yamiz
            prevInput.type = 'text'; // Vaqtinchalik text turiga o'zgartirish
            prevInput.setSelectionRange(value.length, value.length);
            prevInput.type = 'number'; // Qayta number turiga o'zgartirish
            prevInput.value = value; // Qiymatini qaytarish
          }
        }, 0);
      }
    }
  };

  const handleScroll = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Style>
        <Layout>
          <div className='container'>
            <div className="order-head">
              <div className="order-main d-flex align justify">
                <div className='d-flex align'>
                  <button onClick={() => navigate('/purchase-request')} className='btn-back'>Назад</button>
                  <h3 className='title-menu'>Заявка на закупку</h3>
                </div>
                {<button onClick={() => postOrder(get(docEntry, 'id', 0) ? true : false)} className={`btn-head position-relative`}>
                  {orderLoading ? <Spinner /> : (get(docEntry, 'id', 0) ? 'Обновить' : 'Добавить')}
                </button>}
              </div>
              <div className="order-head-data d-flex align justify">

                <div className='w-70'>
                  <input disabled={true} value={get(date, 'DocDate', '')} onChange={(e) => setDate({ ...date, DocDate: e.target.value })} type="date" className='order-inp' placeholder='Doc Date' />
                </div>
                <div className='w-70'>
                  <input value={get(date, 'ReqDate', '')} onChange={(e) => setDate({ ...date, ReqDate: e.target.value })} type="date" className='order-inp' placeholder='Due Date' />
                </div>

                <div className='w-70'>
                  <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} className='order-inp' placeholder='Комментарий' />
                </div>

              </div>

              <div className='right-head order-head-filter'>
                <div className='right-pagination'>
                  <p className='pagination-text'><span>{page}-{ts}</span> <span>of {allPageLength}</span> </p>
                  <button onClick={() => {
                    if (page > 1) {
                      getItems({ page: page - limit, limit, value: search, filterProperty })
                      setPage(page - limit);
                      setTs(ts - limit)
                    }
                  }} disabled={page == 1} className={`pagination-button left-pagination ${page == 1 ? 'opcity-5' : ''}`}>
                    <img src={pagination} alt="arrow-button-pagination" />
                  </button>

                  <button onClick={() => {
                    if (ts < allPageLength) {
                      getItems({ page: page + limit, limit, value: search, filterProperty })
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
                        getItems({ page: 1, limit, value: search })
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
                            getItems({ page: 1, limit: item, value: search, filterProperty })
                          }
                          return
                        }} className={`dropdown-li ${limit == item ? 'dropdown-active' : ''}`}><a className="dropdown-item" href="#">{item}</a></li>)
                      })
                    }
                  </ul>
                </div>
              </div>
            </div>
            <div className='table' >
              <div className='table-head'>
                <ul className='table-head-list d-flex align  justify'>
                  <li className='table-head-item w-30'>Код</li>
                  <li className='table-head-item w-70'>Продукция</li>
                  <li className='table-head-item w-50'>Бранд</li>
                  <li className='table-head-item w-30'>Мера</li>
                  <li className='table-head-item w-30'>Остаток</li>
                  <li className='table-head-item w-20'>Фото</li>
                  <li className='table-head-item w-50'>Количество</li>
                  <li className='table-head-item w-47px'>
                    <button onClick={() => {
                      let filterData = mainData.filter(el => {
                        return Number(el.value) > 0
                      })
                      if (filterData.length) {
                        setAllPageLengthSelect(allPageLengthSelect + filterData.length)
                        setAllPageLength(allPageLength - filterData.length)
                        setMainData(mainData.filter(el => !filterData.map(item => item.ItemCode).includes(el.ItemCode)))
                        setState([...filterData.map(el => {
                          return { ...el, PriceList: { ...el.PriceList, Price: roundMiddle(Number(el.PriceList.Price || 0) + ((el.PriceList.Price || 0) * (get(customerDataInvoice, 'selectMarchantFoiz') || 0) / 100)) } }
                        }), ...state])
                        setActualData([...filterData, ...actualData])
                      }
                    }} className='table-head-check-btn'>
                      <img src={tickSquare} alt="tick" />
                    </button>
                  </li>
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
                                  <div className='w-20 p-16' >
                                    <button style={{ cursor: 'pointer' }} onClick={() => {
                                      imageRef.current?.open({ item });
                                    }} className='btn-businesPartner'>
                                      <img src={imageIcon} width={26} height={26} alt="" />
                                    </button>
                                  </div>
                                  <div className='w-50 p-16' >
                                    <input
                                      ref={(el) => (inputRefs.current[i] = el)}
                                      onKeyDown={(event) => handleKeyDown(event, i)}
                                      value={get(item, 'value', '')}
                                      onWheel={handleScroll}
                                      onChange={(e) => {
                                        if (/^\d*$/.test(e.target.value)) {
                                          changeValue(e.target.value, get(item, 'ItemCode', ''))
                                        }
                                      }}
                                      type="text"
                                      className={`table-body-inp`}
                                      placeholder='-' />
                                  </div>
                                  <div className='w-47px p-16' >
                                    <button
                                      onClick={() => addState(item)}
                                      className={`table-body-text table-head-check-btn`}>
                                      <img src={add} alt="add button" />
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

          <Resizable
            state={state}
            setState={setState}
            setAllPageLengthSelect={setAllPageLengthSelect}
            allPageLengthSelect={allPageLengthSelect}
            setMainData={setMainData}
            setAllPageLength={setAllPageLength}
            allPageLength={allPageLength}
            mainData={mainData}
            actualData={actualData}
            setActualData={setActualData}
            isEmpty={isEmpty}
            setIsEmpty={setIsEmpty}
            limitSelect={limitSelect}
            setLimitSelect={setLimitSelect}
            pageSelect={pageSelect}
            setPageSelect={setPageSelect}
            tsSelect={tsSelect}
            setTsSelect={setTsSelect}
            filterPropertyResize={filterPropertyResize}
            setFilterPropertyResize={setFilterPropertyResize}
            filterData={filterData}
            customerDataInvoice={customerDataInvoice}
            groups={groups}
            imageRef={imageRef}

          />
        </Layout>
      </Style>
      <>
        <ToastContainer />
        <FilterModal
          getRef={filterModalRef}
          filterProperty={filterProperty}
          setFilterProperty={setFilterProperty}
          getItems={getItems}
          arg={{ page: 1, limit, value: search }}
          setPage={setPage}
          setTs={setTs}
          groups={groups}
        />
        <BusinessPartner
          getRef={BusinessPartnerModalRef}
          setCustomerDataInvoice={setCustomerDataInvoice}
          customerDataInvoice={customerDataInvoice}
          setCustomer={setCustomer}
          setCustomerCode={setCustomerCode}
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
        <ConfirmModal getRef={confirmModalRef} title={"Oshibka"} fn={get(docEntry, 'id', '') ? Update : Orders} />
      </>
    </>
  );
};

export default Order;