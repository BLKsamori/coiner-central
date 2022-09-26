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

let CurrentScreen; // Current Page Saver
async function NavTO(PageHeader){
    const MainPage = $(`main`) // page <main> 
    const CurrentPage = $(`#CurrentPage`) // <header> >  <h2>
    // check if current page is clicked
    if((CurrentScreen == PageHeader)&&(CurrentScreen !== undefined)){
        alert(PageHeader +` already on this page`)
        return;
    }
    CurrentScreen = PageHeader;
    // reload new page
    let Page; 
     switch(PageHeader){
        case `Coins`: 
            Page = await CoinsPage(); 
            break;
        case `Live Feeds`: 
            Page = FeedsPage();
            break;
        case `About` : 
            Page = AboutPage(); 
            break;
        default: //default to coins page 
            Page = await CoinsPage(); 
        break;
    }
    CurrentPage.text(PageHeader);
    MainPage.text(``)
    MainPage.append(Page)
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

function Data2Html( CoinObj , WHatToPrint){
    let NewHtml;
    switch(WHatToPrint){
        case "Coins":
            let CoinsList = ``;
            // Key = id , values = name , symbols
            for( const [key , value] of CoinObj){
                CoinsList += `<div class="coinBox">

                    <div id=sec1>
                            <div>
                                <h5>${value.symbol}</h5>     
                                <p>${value.name}</p>          
                            </div>

                            <div>   
                            
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
                        

                            <!-- Compare switch-->
                        <div id=sec2 class="form-check form-switch">
                            <p>add+</p>
                            <br>
                            <input class="form-check-input" type="checkbox" id="Switch_${key}">     
                        </div>
                    </div>

                    
                </div>
                `}

        let Search = `<div id="searchDiv" class="Search" >
        <label onclick="SearchCoins()" for="SearchBox"><i class="bi bi-search"> Search </i></label>
        <input id="SearchBox" type="text">
        </div>`
        CoinsList = `${Search}<section id="CoinsSection">${CoinsList}</section>`;
        NewHtml = CoinsList;
        break;
    case "info":
       
        const  CoinInfoList =  
            `<div class="CoinDetails">
                    <p>
                        <b>Current Price</b> <br>
                        EUR: ${CoinObj.EUR} &#8364 <br>
                        USD: ${CoinObj.usd} &#36 <br>
                        ILS: ${CoinObj.ils} &#8362
                    </p>
                    <img src="${CoinObj.img}" alt="Coin Image"></img>
            </div>`;
        break;
    }
    return NewHtml;
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
        return `no no`;
    }    
}

async function MoreInfo(CoinID){
    try { 
         //get the coin values
        const CoinPicked = CoinsList.get( `${CoinID}` ); 
        console.log( CoinPicked )
            // check if i request the Coins [info] before by searching it in the MAP
        if( ("info") in CoinPicked ){
            console.log('CurrentCoinFo')
            console.log(CoinPicked.info)
            ///FIXME: Time Stamp
            if( !("InfoTime" in CoinPicked) ){
                CoinPicked.InfoTime = undefined;
                console.log(CoinPicked.InfoTime + ` 2222`)
            } 
            let  TimeStamp = TimeStampPuncher( CoinPicked.InfoTime )
            
            if ( TimeStamp [2]){ // check time stamp and update if needed
                return;
            }} 
            CoinPicked.InfoTime = TimeStamp[1]; // setting the new TimeStamp
            // if info is missing so..
            const InfoUrl = `https://api.coingecko.com/api/v3/coins/${CoinID}`;
            let Timeout = 2;
            const InfoData = await APiCatcher( InfoUrl, Timeout )
            //adding info to coin
            CoinPicked.info = { "eur": InfoData.market_data.current_price.eur, 
                    "usd" : InfoData.market_data.current_price.usd, 
                    "ils": InfoData.market_data.current_price.ils,
                    "img": InfoData.image.small }
            console.log(CoinPicked)
            //push the object back to the map
            CoinsList.set( CoinID , CoinPicked )
            const CoinIDCard = $(`#card_${CoinID}`); // input of the MORE INFO
            CoinIDCard.empty() // clean the htmlLOADER for refill with text
            CoinIDCard.append( Data2Html( CoinPicked.info , "info") ) ;
    } catch (error){
        alert(error)
    }    
}

function FeedsPage(){
    alert(`Feed Page`)
}
function AboutPage(){
    alert(`About Page`)
    return `<article> Digital currency- or currency as it's also known- is the transfer of money or payment information via computer networks. It's a virtual unit of currency that can be transferred and received by electronic means. The most popular digital currency is Bitcoin, which is gaining ground in the financial world and becoming more relevant with each passing day.
    Digital currency is easy to transfer and receive since it exists in digital form. Transactions are sent over the internet and saved on computer systems without needing to be physically preserved. This makes digital currency much more convenient than traditional currency since users don't have to seek out a bank or physical location to receive their payment. Digital currency also has many advantages when it comes to security and transaction processing speed. However, there are downsides when compared to physical currency- for example, digital currencies can be hacked or lost easily.
    </article>`
}

function SearchCoins(){
    const SearchInput = document.querySelector(`#SearchBox`);
    if((SearchInput.value == ``)||(SearchInput.value.length < 2)){
        alert(`Input Incorrect`)
        return;
    }
    alert(`Search Coins: ${SearchInput.value}`)

    //clean search box after Results
    SearchInput.value =``;
}



let CoinsReport = [];
function AddCoin2Report(Coin){ 
    alert(`this: `+ Coin)
    if(CoinsReport.find(Coin)){
        alert(`Coin is in already`)
        return;
    } 
    if(CoinsReport.length == 2 ){
        alert(`There are already 2 Coins in the Report`)
        return;
    }
    CoinsReport.push(Coin)
    alert(CoinsReport)
}

/// FIXME: time stamper

function TimeStampPuncher(Time){
    let LastTime = Time;
    const now = new Date()
    const NewTime = now.setMinutes(now.getMinutes() + 2) // set new time Stamp
    
    if(LastTime !== undefined ){ // if it has time stamp
        if( LastTime > NewTime ){
            alert(LastTime +` 2 min have'nt been past yet`+ NewTime )
            return [ null , true ];
        }
    }
    alert(`new Time Stamp`)
    return [ NewTime , false]; 
}