import React from 'react'
import "../globals.css"
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { LoaderProvider } from '@/components/LoaderProvider'
const layout = ({ children }) => {
  return (
     <div className="layout-wrapper layout-content-navbar">
          <div className="layout-container">
            <Sidebar />
            <div className="layout-page">
              <Header />
              <div className="content-wrapper">
               <LoaderProvider>
                
                {children}
              </LoaderProvider>
                
                </div>
            </div>
      <div className="layout-overlay layout-menu-toggle"></div>

      <div className="drag-target"></div>
          </div>
        </div>
  )
}

export default layout