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
    alert(PageHeader)
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
        default: //defualt to coins page 
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


let CoinsList;

async function CoinsPage(){
    try {
        let TimeOut = 2;
        const CoinsUrl = `https://api.coingecko.com/api/v3/coins/list`;
        Loader(TimeOut)
        CoinsList = await APiCatcher(CoinsUrl, TimeOut)
    
        CoinsList = CoinsList.slice(0, 100).map( Coin => 
            Coin = `<div class="coinBox">
                    <div>
                        <h5>${Coin.symbol}</h5>     
                        <p>${Coin.name}</p>          
                        <!-- FIXME: add target for each coin using jQuery-->
                        <button data-target="${Coin.id}" class="btn btn-primary" data-toggle="collapse">More Info</button>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault">
                    </div>
                </div>`).splice("").join("");

                console.log(CoinsList);
                let Search = `<div id="searchDiv" class="Search" >
                <label onclick="SearchCoins()" for="SearchBox"><i class="bi bi-search"> Search </i></label>
                <input id="SearchBox" type="text">
                </div>`
                CoinsList = `${Search}<section id="CoinsSection">${CoinsList}</section>`
                return CoinsList;
    } catch (error){
        alert(error)
        return `no no`;
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