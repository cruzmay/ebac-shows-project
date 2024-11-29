class ShowsApi {
  constructor() {
    this.series = [];
    this.genres = [];
    this.URL = "https://api.tvmaze.com/shows";

    //init functions
    this.getShowsFromApi().then((series) => {
      createUI(series);
    });
  }

  async getShowsFromApi() {
    const response = await axios.get(this.URL);
    const { data } = response;
    let genres = [];
    data.forEach((serie) => {
      serie.genres.forEach((genre) => {
        const genreExist = genres.find((gen) => gen === genre);
        if (!genreExist) {
          genres.push(genre);
        }
      });
    });
    const filteredGenres = genres.map((g) => {
      return {
          results: data.filter((serie) =>
            serie.genres.some((item) => item === g)
          ),
          filter: g,
      };
    });
    return filteredGenres;
  }
}

class ShowsUI {
  constructor(series = []) {
    this.series = series;
    this.mainContainer = null;
    this.seriesSection = null;
    this.heroSection = null;
    this.currentShow = null
    // initializate
    this.init();
  }

  init() {
    this.createIntialElements();

  }
  createIntialElements() {
    const path =  window.location.pathname.split("/").pop()
    const search = Number(window.location.search.replace("?id=", ""))
    console.log(search)
     switch (path) {
        case "index.html":
            this.mainContainer = document.getElementById("main");
            this.seriesSection = document.createElement("section");
            this.seriesSection.id = "shows-section";
            this.getHeroCard()
            this.createCards();
            this.getInfoBtns();
            break;
        case "show.html":
            this.showContainer = document.getElementById("show-description");
            if(search) {
                this.getShow(search).then( data => this.createShowInfo(data))
            } else {
                window.location.href = "/index.html"
            }
            break;
     }
    
  }
async getShow (id) {
const response = await fetch(`https://api.tvmaze.com/shows/${id}`)
const data = await response.json()
return data
}
getHeroCard () {
    // getting ramdom shows to be presented
    const ramdomSeries = this.series[Math.floor(Math.random() * this.series.length)]
    const ramdomShow = ramdomSeries.results[Math.floor(Math.random() * ramdomSeries.results.length)]
    console.log({ramdomShow})
    // creating the image to the canvas
    const div = document.createElement("div")
    div.style.display = "none"
    const image = document.createElement("img")
    image.src = ramdomShow.image.medium
    image.id = "canvas-image"
    image.crossOrigin = "Anonymous";
    this.mainContainer.appendChild(div)
    console.log(image, image.clientHeight, image.clientWidth)
    div.appendChild(image)
    //canvas
    let ctx;
    const container = document.getElementById("hero-container")
    const divContainer = document.createElement("div")
    divContainer.classList.add("hero__controls")
    const h1 = document.createElement("h1")
    const button = document.createElement("button")
    button.classList.add("card_btns")
    button.id = ramdomShow.id
    button.innerText = "more info"
    h1.innerText = ramdomShow.name
    divContainer.appendChild(h1)
    divContainer.appendChild(button)
    container.appendChild(divContainer)
    container.classList.add("hero")
    this.heroSection = document.getElementById("hero")
    console.log(this.heroSection)
    this.heroSection.width =  container.clientWidth - 15
    this.heroSection.height =  container.clientHeight
    ctx = this.heroSection.getContext('2d', { willReadFrequently: true });
    image.addEventListener("load", (e) => {
        ctx.drawImage(image, 100, 0, container.clientHeight * 0.70, container.clientHeight);
        const pixel1 = ctx.getImageData(500, 500, 1, 1).data;
        const pixel2 = ctx.getImageData(100, 100, 1, 1).data;
        const pixel3 = ctx.getImageData(50, 50, 1, 1).data;
        console.log({pixel1, pixel2, pixel3})
        this.heroSection.setAttribute( "style", `background: linear-gradient(90deg, rgba(${pixel1[0]},${pixel1[1]},${pixel1[2]},${pixel1[3]}) 0%, rgba(${pixel2[0]},${pixel2[1]},${pixel2[2]},${pixel2[3]}) 35%, rgba(${pixel3[0]},${pixel3[1]},${pixel1[2]},${pixel3[3]}) 100%);` )
    })
  }
  createCards() {
    this.series.forEach((genre) => {
        const section = document.createElement("section");
        section.classList.add("shows");
        const p = document.createElement("p");
        p.classList.add("shows__genre-title");
        const div = document.createElement("div");
        div.classList.add("shows__list");
        p.textContent = genre.filter;
        section.appendChild(p);
        this.seriesSection.appendChild(section);
        let divContent = "";
        genre.results.forEach((serie) => {
          divContent += card(serie);
        });
        div.innerHTML = divContent;
        section.appendChild(div);
    
    });
    this.mainContainer.appendChild(this.seriesSection);
  }
  getInfoBtns () {
    const buttons = document.querySelectorAll(".card_btns")
    buttons.forEach( btn => btn.addEventListener("click", (e) => {
        const id =  e.target.id
        window.location.href = `show.html?id=${id}` 
        }))
    }
    createShowInfo ( serie ) {
        const info = document.querySelector("#show-description > article");
        const image = document.querySelector("#show-description > figure")
        info.innerHTML = showDescription(serie)
        image.innerHTML = showImage(serie)
    }
}


new ShowsApi();
const createUI = (series) => {
  return new ShowsUI(series);
};

const card = (serie) => {
  const { image, name, summary, id } = serie;
  return `
    <article class="shows__list__card">
        <figure>
            <img src=${image.medium} />
        </figure>
        <div>
            <p>${name}</p>
            <div class="shows__list__card__footer">
              <button class="card_btns" id=${id}>more info</button>
              <button class="material-symbols-outlined">play_arrow</button>  
            </div>
        </div>
    </article>      
    `;
};


const showDescription = ( serie) => {
    console.log(serie)
    return `
    <h2>${serie.name}</h2>
    <article>
    ${serie.summary}
    </article>
    
    `
}

const showImage = (serie) => {
    return `
    <img src=${serie.image.original} alt=${"promocional image of " + serie.name} />
    `
}