const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const data_panel = document.querySelector('#data_panel')  //資料顯示區塊
const search_form = document.querySelector('#search_form') //搜尋form
const search_input = document.querySelector('#search_input') //搜尋input
const paginator = document.querySelector('#paginator') //分頁區塊
const showmode_panel = document.querySelector('#showmode_panel') //切換模式區塊

let movies = [] //存放電影資料
let filteredMovies = [] //存放搜尋過的電影資料

let movies_per_page = 12 //設定每一頁顯示12筆資料
let on_page = 1 //記錄在第幾頁(預設為1)
let show_mode = 'grid' //顯示模式

// 取得電影資料
function getMoviesData(){
  axios.get(INDEX_URL)
    .then((response) => {
      movies.push(...response.data.results) // (...)代表展開運算子，功用是「展開陣列元素」
      renderPaginator(movies.length) // 呼叫產生分頁函式
      renderMovieGrid(getMoviesByPage(1)) //Home Page預設是第1頁，所以取資料固定傳入1
    })
    .catch((err) => {
      console.log(err)
    });
}

// 產生電影清單-卡片模式(預設)
function renderMovieGrid(data){
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3 mb-2">
      <div class="card">
        <img
          src="${POSTER_URL+item.image}"
          class="card-img-top" alt="Moive Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
            data-bs-target="#movie_modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
    `
  });
  data_panel.innerHTML = rawHTML

}

// 產生電影清單-清單模式
function renderMovieList(data){
  let index = (on_page-1)*12+1 //顯示電影項次
  let rawHTML =  `<table id="list_table" class="table"><tbody id="list_tbody">`
  data.forEach((item) => {
    rawHTML += `
      <tr>
      <td scope="row">
        <h4>${index}</h4>
      </td>
      <td colspan="2">
        <h4>${item.title}</h4>
      </td>
      <td>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
          data-bs-target="#movie_modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </td>
    </tr>
    `
    index++
  });
  rawHTML += `</tbody></table>`
  data_panel.innerHTML = rawHTML

}

// 產生分頁按鈕
function renderPaginator(amount){
  let rawHTML = ""
  const number_of_page = Math.ceil(amount / movies_per_page)
  for(let page = 1; page <= number_of_page; page++){
    rawHTML += `<li class=" page-item" style="cursor:pointer"><a class="page-link" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 顯示電影詳細資料(Modal)
function showMovieModal(id){
  const modal_title = document.querySelector('#movie_modal_title')
  const modal_image = document.querySelector('#movie_modal_image')
  const modal_date = document.querySelector('#movie_modal_date')
  const modal_des = document.querySelector('#movie_modal_des')

  // 清除資料
  modal_title.innerText = ''
  modal_image.innerHTML = ''
  modal_date.innerText = ''
  modal_des.innerText = ''

  axios.get(INDEX_URL + id)
    .then((response) =>{
      const data = response.data.results
      modal_title.innerText = data.title
      modal_image.innerHTML = `<img class="ig-fluid" src="${POSTER_URL + data.image}" alt="moive-poster" />`
      modal_date.innerText = 'Release Date： ' + data.release_date
      modal_des.innerText = data.description
    })
    .catch((error) =>{
      console.log(error)
    })
} 

// 新增電影至Favorite
function addFavoriteMovie(id){
  const list = JSON.parse(localStorage.getItem('favorites')) || [] // "||" 是or運算子，當localStorage沒有資料時回傳空陣列
  const movie = movies.find(movie => movie.id === id) // 用find()將moives陣列裡的資料取出id相對應的id

  if(list.some(movie => movie.id === id)){
    return alert('此電影已在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favorites',JSON.stringify(list)) //存到localStorage

}

// 取得每頁電影資料
function getMoviesByPage(page){
  const index = (page - 1) * movies_per_page //計算出每頁資料的開始位置(index)
  on_page = page
  let data = filteredMovies.length ? filteredMovies : movies //當filteredMovies沒資料(空陣列)時，則回傳movies陣列
  return data.slice(index,index + movies_per_page)
}

// 顯示電影詳細資料事件
data_panel.addEventListener('click', function onPanelClicked(event){
  if(event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  }
  else if(event.target.matches('.btn-add-favorite')){
    addFavoriteMovie(Number(event.target.dataset.id))
  }
})

// 搜尋電影事件
search_input.addEventListener('input',function onSearchSubmitted(event){
  event.preventDefault()
  const keyword = search_input.value.trim().toLowerCase()
  const no_search_result = document.querySelector('#no_result')
  // .trim() 將字串頭尾多餘的空白去除
  // .toLowerCase() 將字串轉成小寫

  // 方法一 使用for迴圈搭配.includes()
  // for(const movie of movies){
  //   if(movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }
      
    // 方法二 使用Array的.filter()
    filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
      
    // 判斷搜尋字串
  if(filteredMovies.length == 0){
    no_search_result.innerText = "找不到相關的電影!! \n 你的搜尋關鍵字為：" + keyword
    data_panel.innerHTML = ''
  }
  else{
    no_search_result.innerText = ''
    renderPaginator(filteredMovies.length)

    if(show_mode === 'list'){
      renderMovieList(getMoviesByPage(1))
    }
    else{
      renderMovieGrid(getMoviesByPage(1))
    }
  }

})

// 分頁點擊事件
paginator.addEventListener('click',function onPaginatorClicked(event){
  let page = Number(event.target.dataset.page)
  if(show_mode === 'list'){
    renderMovieList(getMoviesByPage(page))
  }
  else{
    renderMovieGrid(getMoviesByPage(page))
  }
})

// 卡片模式與清單模式點擊事件
showmode_panel.addEventListener('click', function onShowModeChanged(event){
  event.preventDefault();
  const grid_btn = document.querySelector('#grid_btn')
  const list_btn = document.querySelector('#list_btn')

  if(event.target.matches('.btn_grid')){
    grid_btn.classList.add('btn-secondary')
    list_btn.classList.remove('btn-secondary')
    show_mode = 'grid'
    renderMovieGrid(getMoviesByPage(1))
  }
  else if(event.target.matches('.btn_list')){
    grid_btn.classList.remove('btn-secondary')
    list_btn.classList.add('btn-secondary')
    show_mode = 'list'
    renderMovieList(getMoviesByPage(1))
  }
})


getMoviesData()
