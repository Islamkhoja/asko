import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Launch, Login, Home, Order, Outgoing, Payment, CashReport, PurchaseRequest, PurchaseRequestAdd, StockTransfers, StockTransfersAdd, WarehouseBalanceReport, WarehouseBalanceReportCRM, WarehouseWithoutMovement, ReportSalesAnalysis, ProductFlowReport, PurchaseRequestAddReturn, PurchaseRequestReturn, PricePrint } from '../screens';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Launch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        <Route path="/purchase-request" element={<PurchaseRequest />} />
        <Route path="/purchase-return" element={<PurchaseRequestReturn />} />

        <Route path="/purchase-request-add" element={<PurchaseRequestAdd />} />

        <Route path="/purchase-return-add" element={<PurchaseRequestAddReturn />} />

        <Route path="/purchase-request-add/:id" element={<PurchaseRequestAdd />} />
        <Route path="/purchase-return-add/:id" element={<PurchaseRequestAddReturn />} />

        <Route path="/stock-transfers" element={<StockTransfers />} />
        <Route path="/stock-transfers-add" element={<StockTransfersAdd />} />
        <Route path="/stock-transfers-add/:id/:draft" element={<StockTransfersAdd />} />

        <Route path="/invoice" element={<Order />} />
        <Route path="/invoice/:id" element={<Order />} />
        <Route path="/outgoing" element={<Outgoing />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/:id/:draft" element={<Payment />} />


        <Route path="/cash-report" element={<CashReport />} />
        <Route path="/warehouse-balance-report" element={<WarehouseBalanceReport />} />
        <Route path="/warehouse-balance-report-crm" element={<WarehouseBalanceReportCRM />} />
        <Route path="/warehouse-without-movement" element={<WarehouseWithoutMovement />} />

        <Route path="/price-print" element={<PricePrint />} />

        <Route path="/report-sales-analysis" element={<ReportSalesAnalysis />} />
        <Route path="/product-flow-report" element={<ProductFlowReport />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
