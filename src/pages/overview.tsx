import "../Styles/overview.css"


export default function OverviewPage(){
    
    return (
        <div className="container">
           <header className="heading">
            <h1>Dashboard</h1>
           </header>

            <div className="dashboardGrid">
              <div className="rowFour">
                <div className="card">
                   <h3 className="cardTitle"> Total Users</h3>
                </div>
                <div  className="card">
                   <h3 className="cardTitle">Active Bookings</h3>
                </div>
                <div  className="card">
                   <h3 className="cardTitle"> Total Revenue</h3>
                </div>
                <div  className="card">
                   <h3 className="cardTitle"> Service Providers</h3>
                </div>
              </div>
            </div>
                
          <div className="rowTwo">
            <div className="largeCard">
                <h3 className="cardTitle">Booking Trends</h3>
            </div>
            <div className="largeCard">
                <h3 className="cardTitle">Booking Trends</h3>
            </div>
          </div>

          <div className="cardFull">
            <h3 className="cardTitle"> Recent Activity</h3>
          </div>

        </div>

)}