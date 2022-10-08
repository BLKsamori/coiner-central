// Coin list site https://www.coingecko.com/en/api/documentation
// Coin compare site https://min-api.cryptocompare.com
$(document).ready(function StartPage(){
    NavTO()
})

function Loader(timeout){
    if((timeout == 0)||(timeout == undefined)){
        return;
    }
    const Loader = $(`#LoaderDIV`)
    Loader.removeClass(`hideIt`)
    setTimeout(() => {
        Loader.addClass(`hideIt`)
    }, 1000 * timeout);
}
const MainPage = $(`main`) // page <main> 
let CurrentScreen; // Current Page Saver

async function NavTO(PageHeader){
    const CurrentPage = $(`#CurrentPage`) // <header> >  <h2>
    // check if current page is clicked
    if((CurrentScreen == PageHeader)&&(CurrentScreen !== undefined)){
        console.log(PageHeader +` already on this page`)
        return;
    }
    CurrentScreen = PageHeader;
    // reload new page
    let Page; 
     switch(PageHeader){
        case `Coins`: 
            Page = await CoinsPage();
            CoinsReport.length = 0 
            MainPage.html(``)
            MainPage.append(Page)
            break;
        case `Feeds`:
            await FeedsPage();
            break;
        case `About` : 
            Page = AboutPage(); 
            CoinsReport.length = 0
            MainPage.html(``)
            MainPage.append(Page)
            break;
        default :
            Page = await CoinsPage(); 
            CoinsReport.length = 0
            MainPage.html(``)
            MainPage.append(Page)
        break;
    }
    CurrentPage.text(PageHeader);
}

function APiCatcher(urlInput, timeout){
    return new Promise( (resolve, reject)=>{
        setTimeout(() => {
            $.ajax({
                url: urlInput,
                success: data => resolve(data),
                error: err => reject(err) 
            })
        }, 1000 * timeout);
        
    } )
   
}

// FIXME: coin search continue the API
async function SearchCoins(){
    const SearchInput = document.querySelector(`#SearchBox`);
    if((SearchInput.value == ``)||(SearchInput.value.length < 2)){
        alert(`Input Incorrect`)
        return;
    }
    alert(`Search Coins: ${SearchInput.value}`)
    try {
    const SearchUrl = `https://api.coingecko.com/api/v3/search?query=${SearchInput.value}`
    const SearchedCoin = APiCatcher(SearchUrl)
        // 
        // FIXME:
        // CODE GOES HERE
        // 


    //clean search box after Results
    SearchInput.value =``;
    } catch(error) {
        alert(error)
    }
}

let CoinsList = new Map();

async function CoinsPage(){
    try {
        let TimeOut = 2;
        const CoinsUrl = `https://api.coingecko.com/api/v3/coins/list`;
        Loader(TimeOut)
        let CoinJson = await APiCatcher(CoinsUrl, TimeOut)
        CoinJson = CoinJson.slice(0, 100)
        for ( const Coin of CoinJson ){
            // setting to the Map the [Key as the id] & [value as name and symbol.. later add the currency and image]
            CoinsList.set( Coin.id , { "name": Coin.name, "symbol": Coin.symbol } )
        }
        console.log(CoinsList)
        return Data2Html(CoinsList , "Coins")         
    } catch (error){
        alert(error)
        return `Problem With the SERVER`;
    }    
}

async function MoreInfo(CoinID){
    try { 
         //get the coin values
        const CoinPicked = CoinsList.get( `${CoinID}` ); 
        console.log(CoinPicked)

        // setting timeStamp 
        const TimeStamp = TimeStampPuncher( CoinPicked.InfoTime )
            // check if i request the Coins [info] before by searching it in the MAP
        if( CoinPicked.Info  ){
            // check time stamp is valid
            if ( TimeStamp[1]){ 
                return;
            }
        } 
        console.log(`what is this`)
        // Store Time stamp in the Coin obj
        CoinPicked.InfoTime = TimeStamp[0]; // setting the new TimeStamp
        // if info is missing so..
        const InfoUrl = `https://api.coingecko.com/api/v3/coins/${CoinID}`;
        let Timeout = 2;
        const InfoData = await APiCatcher( InfoUrl, Timeout )
        //adding info to coin
        CoinPicked.Info = { "eur": InfoData.market_data.current_price.eur, 
                "usd" : InfoData.market_data.current_price.usd, 
                "ils": InfoData.market_data.current_price.ils,
                "img": InfoData.image.small }
        console.log(CoinPicked)
        //push the object back to the map
        CoinsList.set( CoinID , CoinPicked )
        const CoinIDCard = $(`#card_${CoinID}`); // input of the MORE INFO
        CoinIDCard.empty() // clean the htmlLOADER for refill with text
        CoinIDCard.append( Data2Html( CoinPicked.Info , "info") ) ;
    } catch (error){
        alert(error)
    }    
}

function TimeStampPuncher(Time){
    
    // declare time
    const LastTime = Time;
    const now = new Date();
    const NewTime = new Date().setMinutes( now.getMinutes() + 2); // set new time Stamp
    // alert( NewTime)

    // array to return Value & boolean for IF() statement
    const NewDate  = [ now.valueOf() , false ]
    const ReplaceDate = [ NewTime , false];
    const OldDate = [ LastTime , true ];
     
    // if there is no time stamp
    if(LastTime == undefined){
        return NewDate;
    }
    // if 2 minute have NOT past
    if( LastTime !== undefined ){ 
        if( LastTime < NewTime ){
           return OldDate;
        } 
    }

    // if 2 minute Have past
    return ReplaceDate; 
}

/// REPORT BANNER ON COIN PAGE
let CoinsReport = [];
let CoinsReportBanner = [];

function AddCoin2Report(CoinID){ 
   
  //check if coin has checked or unchecked
  const CoinCheckBox = $(`#Switch_${CoinID}` )
  if( !CoinCheckBox.prop( 'checked')){
    // remove the coin
    CoinsReport = CoinsReport.filter(coin => coin.id !== CoinID) //.delete()
    return;
  }
  const NewCoinReport = {"id": CoinID,"name": CoinsList.get(CoinID).name, "symbol": CoinsList.get(CoinID).symbol}
  if(CoinsReport.length > 4 ){
    CoinCheckBox.prop( 'checked' , false) // unchecked the item
    CoinsReportBanner = CoinsReport;
    CoinsReportBanner.push(CoinID )
   
    MainPage.append(Data2Html( CoinsReportBanner , "reportBanner")) ///FIXME:
      return;
  } else {
    CoinsReport.push(NewCoinReport)
  }
  //FIXME: ADD save array in the Storage
}
/// report Banner banner

function CoinReportBanner(CoinID){ 

    const ReportBanner = $(`.ReportBannerScreen`) // the Report Banner

    const CoinCheckBanner = $( `#Check_${CoinID}`)  //$( `#Check_CoinID`)
    alert(`this: `+ CoinID)

  // if Cancel button was pushed
  if ( CoinID == `cancel`){
    ReportBanner.remove()
    return;
  }
  if ( CoinID == `done`){
    alert('About DOn: ' + CoinsReportBanner.length) 
    if(CoinsReportBanner.length > 5 ){
          return;
      }

    CoinsReport = CoinsReportBanner;
    for( const Coin in CoinsReport ){
        const CoinChecked = $(`#Switch_${Coin}` )
        CoinChecked.prop( 'checked' , true)
    }
    ReportBanner.remove()
    return;
  }

  if( !CoinCheckBanner.prop( 'checked')) {
    CoinsReportBanner = CoinsReportBanner.filter(coin => coin.id !== CoinID)
    return;
    } else{
        alert(` is in`)
        const NewCoinReport = {"id": CoinID,"name": CoinsList.get(CoinID).name , "symbol": CoinsList.get(CoinID).symbol}
        CoinsReportBanner.push(NewCoinReport)
    } 
}

let CoinsPricesArr = [];

function FeedsPage(){
    
        if(CoinsReport.length == 0){
            MainPage.html(``)
            MainPage.append(Data2Html( CoinsReport , "EmptyFeed"))
            return;
        }
        let CoinsSymbols = [];
        for(const Coin of CoinsReport){
            console.log(Coin);
            CoinsSymbols.push(Coin.symbol)
            console.log(Coin.symbol);
        }

        MainPage.html(``)
        //Append the Div for the Chart
        MainPage.append(Data2Html( "" , "Feed"))
        //then Add the Chart to the DIV

        CoinsSymbols = CoinsSymbols.splice("").join().toUpperCase()
        const ApiKey = `3fa63ebf50a7a9985593e34a3bff90add4979f3b6445759dfe38779bf898e559`
        const CoinsPriceUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=` + CoinsSymbols + `&tsyms=USD&extraParams=` + ApiKey;
        Loader(2)
        FeedsChart(CoinsPriceUrl)
        return ;
}


function AboutPage(){
    alert(`this is About Page`)
    return Data2Html( "" ,  "About");
}


function Data2Html( CoinObj , WHatToPrint){
    let NewHtml =``;
    switch(WHatToPrint){
        
        case "Coins":
            let CoinsList = ``;
            // Key = id , values = name , symbols
            for( const [key , value] of CoinObj){
                CoinsList += 
                `<div class="coinBox">

                        <div id=prt1>
                            <div>
                                <h5>${value.symbol}</h5>     
                                <p>${value.name}</p>          
                            </div>

                            <!-- Compare switch-->
                            <div class="form-check form-switch">
                                <p> Add+</p>
                                <input onchange="AddCoin2Report('${key}')" class="form-check-input" type="checkbox" id="Switch_${key}">     
                            </div>
                            
                        </div>
                        

                        
                        <!-- Collapse -->
                        <div id=prt2 >   
                                <button onclick="MoreInfo('${key}')" id="Btn_${key}" data-bs-target="#Info_${key}" class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="Info_${value.id}">
                                    More Info
                                </button>
                            
                                <div class="collapse" id="Info_${key}">
                                    <div id="card_${key}" class="card card-body">
                                                <img id="LoaderSmallGIF" src="https://c.tenor.com/xCav_HCNw-QAAAAj/flipping-coin-gold-flipping-coin.gif" alt="">
                                    </div>
                                </div>
                        </div>

                </div>
                `}

        const Search = `<div id="searchDiv" class="Search" >
        <label onclick="SearchCoins()" for="SearchBox"><i class="bi bi-search"> Search </i></label>
        <input id="SearchBox" type="text">
        </div>`
        const SectionCoin = `${Search}<section id="CoinsSection">${CoinsList}</section>`;
        NewHtml = SectionCoin;
        break;

    case "info":
       
         NewHtml =  
            `<div class="CoinDetails">
                    <p>
                        <b>Current Price</b> <br>
                        EUR: ${CoinObj.eur} &#8364 <br>
                        USD: ${CoinObj.usd} &#36 <br>
                        ILS: ${CoinObj.ils} &#8362
                    </p>
                    <img src="${CoinObj.img}" alt="Coin Image"></img>
            </div>`;
        break;

    case "reportBanner":
        NewHtml += `<section class="ReportBannerScreen">
        <div class="BackDropReport"></div>
        <section class="ReportBanner">
            <span> You Can Add Up to 5 Coins</span>
            <h2>Coin Report <span>(${CoinObj.length})</span></h2>`;
        
        CoinObj.forEach( Coin => {
            NewHtml += `<div id="report_${Coin.id}" class="CoinReportLine"> 
            <label for="Check_${Coin.id}" >
                <h5>${Coin.id}</h5>
                <p>Z${Coin.name}</p>
            </label> 
            <input onchange="CoinReportBanner('${Coin.id}')" class="form-check-input" type="checkbox" id="Check_${Coin.id}" checked>         
        </div>`});
        NewHtml += `<div class="EndReport">
                        <button onclick="CoinReportBanner('cancel')" >Cancel</button>
                        <button onclick="CoinReportBanner('done')" >Done</button>
                     </div>
             </section>
        </section>`;
        break;

    case "EmptyFeed":
        NewHtml = `<div class="emptyFeeds"> 
            <p>
                Feeds are <b>Empty</b>, (${CoinObj.length}) Coins to Compare. <br>
                Please add Coins from the Coins-Page
                and come back.
            </p>
    </div>`
        break;

    case "Feed":
        NewHtml = `<div id="chartContainer" style="height: 300px; width: 100%;"></div>`
        break;
    case "About":
        NewHtml = `<article> Digital currency- or currency as it's also known- is the transfer of money or payment information via computer networks. It's a virtual unit of currency that can be transferred and received by electronic means. The most popular digital currency is Bitcoin, which is gaining ground in the financial world and becoming more relevant with each passing day.
        Digital currency is easy to transfer and receive since it exists in digital form. Transactions are sent over the internet and saved on computer systems without needing to be physically preserved. This makes digital currency much more convenient than traditional currency since users don't have to seek out a bank or physical location to receive their payment. 
        <br> Digital currency also has many advantages when it comes to security and transaction processing speed. However, there are downsides when compared to physical currency- for example, digital currencies can be hacked or lost easily.
        <br><br> So while U hold on your precious coins we will provide you with the stat so you will never get caught sleeping on your wallet.
        </article>`;
        break;
    }

    return NewHtml;
}



///
function FeedsChart(CoinsUrl){
	

    var CoinsPoints = [];
    CoinsPoints.length = 0

    var options =  {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: "Daily Sales Data"
        },
        axisX: {
            title: "Time"
        },
        axisY: {
            title: "USD",
            titleFontSize: 24
        },
        data: CoinsPoints
    };
     
    $("#chartContainer").CanvasJSChart(options);
    updateData();
    
    function addData(dataInput) {
        // new time
        let now = new Date()
        let NewDate = CanvasJS.formatDate( now, "mm:ss")
        console.log(`CoinsPoints`);
        console.log(CoinsPoints);
        // make new Line if its the first round of pulling data
        const InputLength = Object.keys(dataInput).length;
        if(InputLength > CoinsPoints.length ){
            for (let key in dataInput) {
                CoinsPoints.push( {type: "spline",
                name: key,
                showInLegend: true,
                dataPoints: [] })
            }
        }
        // adding point to date and USD price
        for (let key in dataInput) {
            CoinsPoints.find(  n => { n.name == key ;
                n.dataPoints.push({
                    x: NewDate,
                    y: dataInput[key].USD
            })
            } )
          }
          console.log(CoinsPoints);
        $("#chartContainer").CanvasJSChart().render();
        setTimeout(updateData, 1500);
    
    }
    function updateData() {
        $.getJSON(CoinsUrl, addData);
    }

 }