import React, { memo, useEffect, useState } from 'react';
import Styles from './Styles';
import Modal from 'react-modal';

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import { useTranslation } from 'react-i18next';
import { errorNotify, statuses, successNotify, warehouseList } from '../../Helper';
import arrowDown from '../../../assets/images/arrow-down.svg';
import CloseFilter from '../../../assets/images/close.svg'
import { get } from 'lodash';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FadeLoader } from 'react-spinners';
import Spinner from '../../Spinner';
import formatterCurrency from '../../../helpers/currency';
let url = process.env.REACT_APP_API_URL

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    padding: 0,
    borderRadius: 0,
    width: '1030px',
    height: 'auto', // oldin 670px edi
    overflow: "auto"
  },
  overlay: {
    background: '#0000008D',
    zIndex: '1000'
  },
};




const PrintModal = ({ getRef }) => {
  const { t } = useTranslation();
  const { getMe } = useSelector(state => state.main);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [mainData, setMainData] = useState([])

  useEffect(() => {
    const ref = {
      open: (data) => {
        setIsOpenModal(true);
        setMainData(data)
      },
      close: () => {
        setIsOpenModal(false)
      },
    };
    getRef(ref);
  }, []);



  return (
    <Modal
      isOpen={isOpenModal}
      onRequestClose={() => {
        setIsOpenModal(false)
      }}
      style={customStyles}
      contentLabel="Example Modal"
      ariaHideApp={false}>

      <Styles>
        <div className="card">

          {
            mainData.length && (
              <ul className='print-list'>
                {
                  mainData.map((el, i) => {
                    return (
                      <li className='print-item' key={i}>
                        <span style={{ textAlign: 'right' }} className='db'>+998 90 336 74 48</span>

                        <b style={{ fontSize: '25px', textAlign: 'center' }} className='db'>{get(el, 'ItemName')}</b>
                        <span style={{ fontSize: '18px' }} className='db'>{formatterCurrency(Number(get(el, 'PriceList.Price', 0) || 0), 'UZS')}</span>

                      </li>
                    )
                  })
                }
              </ul>
            )
          }
        </div>
      </Styles>
    </Modal>
  );
};

export default memo(PrintModal);
