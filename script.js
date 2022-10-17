// Coin list site https://www.coingecko.com/en/api/documentation
// Coin compare site https://min-api.cryptocompare.com
$(document).ready(function StartPage(){
    NavTO();
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
        return;
    }
    CurrentScreen = PageHeader;
    // reload new page
    let Page; 
     switch(PageHeader){
        case `Coins`: 
            Page = await CoinsPage();
            MainPage.html(``)
            MainPage.append(Page)
            break;
        case `Feeds`:
            await FeedsPage();
            break;
        case `About` : 
            Page = AboutPage(); 
            MainPage.html(``)
            MainPage.append(Page)
            break;
        default :
            Page = await CoinsPage(); 
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
function SearchCoins(){
    let SearchResults = new Map();
    const SearchInput = $(`#SearchBox`);
    const SearcSec = $('#CoinsSearchSection');
    const SearchValue = SearchInput.val();
    
    if( (SearchValue == ``)||(SearchValue < 2) ){
        if( SearcSec.children().length ){
            SearcSec.remove();
         }
        ErrorBanner( "Search" )
        return;
    }
    const SearchRegex = eval(`/${SearchValue}/`);
    for( const [key, value] of CoinsList.entries() ){
        if(  (SearchRegex.test( key )) || (SearchRegex.test( value )) ){
            SearchResults.set(key , value);
        }
    }
    SearchInput.val(``);
    MainPage.append( Data2Html( SearchResults ,"Search") );
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
        return Data2Html(CoinsList , "Coins")         
    } catch (error){
        ErrorBanner( "Coin Page")
    }    
}

async function MoreInfo(CoinID){
    try { 
         //get the coin values
        const CoinPicked = CoinsList.get( `${CoinID}` ); 

        // setting timeStamp 
        const TimeStamp = TimeStampPuncher( CoinPicked.InfoTime )
            // check if i request the Coins [info] before by searching it in the MAP
        if( CoinPicked.Info  ){
            // check time stamp is valid
            if ( TimeStamp[1]){ 
                return;
            }
        } 
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
    const Compare_Counter = $('.go_compare b');
    const CompareBtn = $('.counter_box')
    const TrashCan = $('.clean_compare ')
   const CoinCheckBox = $(`#Switch_${CoinID}` ) // checkbox Switch 
   const ClearCompare = () =>{
        Compare_Counter.html(  CoinsReport.length )
       CompareBtn.removeClass( 'CompareActive')
       const Switches = $('.form-check-input' );
       $.each( Switches,  function(){
           $(this).prop( 'checked' , false)
        })
    }
    if( CoinID == 'clear_Compare'){
        CoinsReport.length = 0;
        ClearCompare()
        return;
    }
    //check if coin has checked or unchecked
  if( !CoinCheckBox.prop( 'checked')){
    // remove the coin
    CoinsReport = CoinsReport.filter(coin => coin.id !== CoinID) //.delete()
    Compare_Counter.html(  CoinsReport.length )
    if(CoinsReport.length == 0 ){
        ClearCompare()
    }
    return;
  }
  const NewCoinReport = {"id": CoinID,"name": CoinsList.get(CoinID).name, "symbol": CoinsList.get(CoinID).symbol}
  if(CoinsReport.length  > 4  ){
    CoinCheckBox.prop( 'checked' , false) // unchecked the item 
    CoinsReportBanner = CoinsReport;
    CoinsReportBanner.push( NewCoinReport ); //adding the EXTRA coin
    MainPage.append(Data2Html( CoinsReportBanner , "reportBanner")) 
        for( const coin of CoinsReportBanner ){
            const CheckBoxReport = $(`#Check_${coin.id}`)
            CheckBoxReport.prop( 'checked' , true)
        }
      return;
  } else {
      CoinsReport.push(NewCoinReport)
      Compare_Counter.html(  CoinsReport.length )
      CompareBtn.addClass( 'CompareActive')
      return;
  }
}

/// report Banner banner
function CoinReportBanner(CoinID){ 
    console.log("CoinsReportBanner");
    console.log(CoinsReportBanner);
    console.log("CoinsReport");
    console.log(CoinsReport);
    const ReportBanner = $(`.ReportBannerScreen`) // the Report Banner
    const CoinCheckBanner = $(`#Check_${CoinID}`)  //$( `#Check_CoinID`)
    
    // END report buttons
    // if Cancel button was pushed
    if ( CoinID === `cancel`){
        CoinsReportBanner.length = 0;
        ReportBanner.remove()
        return;
    }
    // if Done button was pushed
    if ( CoinID === 'done'){
        if(CoinsReportBanner.length > 5 ){
            ErrorBanner("ReportFull")
            return;
        }
        
        AddCoin2Report('clear_Compare') 
        CoinsReport = CoinsReportBanner;
        for( const coin of CoinsReport ){
            const swicthReport = $(`#Switch_${coin.id}`)
            swicthReport.prop( 'checked' , true)
        }
        CoinsReportBanner.length = 0;
        ReportBanner.remove()
        return;
    }
    if( !CoinCheckBanner.prop( 'checked')) {
        CoinsReportBanner = CoinsReportBanner.filter(coin => coin.id !== CoinID);
        } else {
        const NewCoinReport = {"id": CoinID,"name": CoinsList.get(CoinID).name, "symbol": CoinsList.get(CoinID).symbol};
          CoinsReportBanner.push(NewCoinReport)
      } 
      $('#reportCount').html(CoinsReportBanner.length);
      return;

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
            CoinsSymbols.push(Coin.symbol)
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
    return Data2Html( "" ,  "About");
}

function ErrorBanner( TypeError){
    let MessageError = ``;
    switch(TypeError){
        case "Coin Page":
            MessageError =  Data2Html( `Problem With the SERVER, Please Try again with i a few moments.`,  "New Alert" ) ;
            break;
        case "Search":
            MessageError = Data2Html( `No match for the phrase, <br> Please try different phrase with 2 or more letters.`, "New Alert" );
            break;
        case "ReportFull":
            MessageError = Data2Html( "Too Many Coins.<br> Please Remove Some coins to max of 5 Coins in Total.","New Alert" );
            break;
        case "close":
            $(".new_alert").remove();
            break;
        default:
            MessageError = Data2Html( "Something break pls try again","New Alert" );
            break;
    }
    MainPage.append(MessageError)
     return;
    
}
function Data2Html( CoinObj , WHatToPrint){
    let NewHtml =``;
    switch(WHatToPrint){
        case "Search":
            let CoinsSearchPrint = ``;
            // Key = id , values = name , symbols
            for( const [key , value] of CoinObj){
                CoinsSearchPrint += 
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
        const ClosedBtn = ` <button onclick="SearchCoins()">
                <i class="bi bi-x-square-fill"></i> 
            </button>`;
        const SectionSearched = `<section id="CoinsSearchSection">
                <h5> Search Results ${ClosedBtn}</h5>
                <section class="searchResult">
                    ${CoinsSearchPrint}
                 </section>
            </section>`;
        NewHtml = SectionSearched;
        break;

        case "Coins":
            let CoinsListPrint = ``;
            // Key = id , values = name , symbols
            for( const [key , value] of CoinObj){
                CoinsListPrint += 
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
        <input id="SearchBox" type="search" placeholder="type here..">
        </div>`;
        const Compare_Counter = `<div class="counter_box">
                <button onclick="NavTO('Feeds')" class="go_compare">
                    Compare <b>0</b> Coins
                </button>
                <button class="clean_compare">
                    <i class="bi bi-trash trash_compare" onclick="AddCoin2Report('clear_Compare')"></i>
                </button>
            </div>`;
        const SectionCoin = `<div class="middle_bar">
                                    ${Compare_Counter}
                                    ${Search}
                                </div>
                            <section id="CoinsSection">
                                ${CoinsListPrint}
                            </section>`;
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
        let NewReportCOin = ``;
        
        CoinObj.forEach( Coin => {
            NewReportCOin += `<div id="report_${Coin.id}" class="CoinReportLine"> 
            <span>${CoinObj.indexOf(Coin) + 1} </span>
            <label for="Check_${Coin.id}" >
                <h5>${Coin.id}</h5>
                <p>Z${Coin.name}</p>
            </label> 
            <input onchange="CoinReportBanner('${Coin.id}')" class="form-check-input" type="checkbox" id="Check_${Coin.id}">         
        </div>`});
        const EndReport = `<div class="EndReport">
                            <button onclick="CoinReportBanner('cancel')" >Cancel</button>
                            <button onclick="CoinReportBanner('done')" >Done</button>
                        </div>`;
        const ReportSection= `<section class="ReportBannerScreen">
                <div class="BackDropReport">
                </div>
                <section class="ReportBanner">
                    <span> You Can Add Up to 5 Coins</span>
                    <h2><span id="reportCount">${CoinObj.length}</span> Coin in The Report </h2>
                    <section class="reportList">
                        ${NewReportCOin}
                        ${EndReport}
                    </section>
                </section>
            </section>`;
        NewHtml = ReportSection;
        break;

    case "EmptyFeed":
        NewHtml = `<div class="emptyFeeds"> 
            <h1> Oops</h1>
            <p>
                Feeds are <b>Empty</b>, (${CoinObj.length}) Coins to Compare. <br>
                Please add Coins from the Coins-Page
                and come back.
            </p>
    </div>`
        break;

    case "Feed":
        NewHtml = `<section class="LiveFeeds">
                    <div id="chartContainer" style="height: 300px; width: 100%;">
                    </div>
                    <div id="chartSummery"><div>
                <section>`
        break;
    case "About":
        NewHtml = `<section class="about">
        <h3>Crypto Central<h3>
        <article> Digital currency- or currency as it's also known- is the transfer of money or payment information via computer networks.<br> It's a virtual unit of currency that can be transferred and received by electronic means. The most popular digital currency is Bitcoin, which is gaining ground in the financial world and becoming more relevant with each passing day.
        Digital currency is easy to transfer and receive since it exists in digital form. Transactions are sent over the internet and saved on computer systems without needing to be physically preserved. This makes digital currency much more convenient than traditional currency since users don't have to seek out a bank or physical location to receive their payment. 
        <br><br> Digital currency also has many advantages when it comes to security and transaction processing speed. However, there are downsides when compared to physical currency- for example, digital currencies can be hacked or lost easily.
        <br><br> So while U hold on your precious coins we will provide you with the state so you will never get caught sleeping on your wallet.
        </article>
        </section>`;
        break;
    case "New Alert":
        NewHtml = `<div class="new_alert">
                        <div class="alert_head">
                            <button onclick="ErrorBanner('close')">
                                <i class="bi bi-x-square-fill"></i> 
                            </button>
                            <h5> ERROR !</h5>
                        </div>
                        <div class="alert_body">
                             <p> ${CoinObj} </p>
                        </div>
                    </div>`;
    }

    return NewHtml;
}


function FeedsChart(CoinsUrl){
    //clear the Coin array for the next Compare 
    CoinsReport.length = 0 
    
    var CoinsPoints = [];
    CoinsPoints.length = 0
    
    var options =  {
        animationEnabled: true,
        theme: "dark2",
        title: {
            text: "Daily Crypto Data"
        },
        toolTip: {
            shared: true
        },
        axisX: {
            title: "Time per Sec"
        },
        axisY: {
            title: "Price in USD",
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
        
        // make new Line if its the first round of pulling data
        const InputLength = Object.keys(dataInput).length;
        if(InputLength > CoinsPoints.length ){
            for (let key in dataInput) {
                CoinsPoints.push( {
					name: key,
					type: "spline",
					xValueFormatString: "HH:mm:ss",
					showInLegend: true,
					dataPoints: [] })
            }
        }

        let SummeryOfChartText = `<h4>Coin Latest Prices</h4> <p>`;
        for ( const CoinName in dataInput){
            // adding point to date and USD price
            CoinsPoints.find(  CoinLine => CoinLine.name == CoinName)
            .dataPoints.push({ x: now,
                            y: dataInput[CoinName].USD })  
            // Formatting the price to show on the div
            const PriceToString = dataInput[CoinName].USD.toLocaleString("en-US");
            // adding Latest price for easy watch Div
             SummeryOfChartText += `<b> ${CoinName} </b>: ${PriceToString} &#36 <br>`
        }   
        SummeryOfChartText += `</p>`;
        // shift when data get too crowded
        if (CoinsPoints[0].dataPoints.length > 20 ) {
            CoinsPoints.forEach(  CoinLine => CoinLine.dataPoints.shift())
        }

         // update the Summery Text
         $("#chartSummery").html(``)
         $("#chartSummery").append(SummeryOfChartText)
        $("#chartContainer").CanvasJSChart().render();
        setTimeout(updateData, 1000 * 2);
    
    }
    function updateData() {
        $.getJSON(CoinsUrl, addData);
    }

 }