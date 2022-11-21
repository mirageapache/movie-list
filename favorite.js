const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const data_panel = document.querySelector('#data_panel')
const search_form = document.querySelector('#search_form')
const search_input = document.querySelector('#search_input')

const movies = JSON.parse(localStorage.getItem('favorites'))

// 產生電影清單
function renderMovieList(data){
  let rawHTML = ''
  data.forEach((item) => { //用Array.forEach()把資料產出
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
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
        </div>
      </div>
    </div>
    `
  });
  data_panel.innerHTML = rawHTML

}

// 顯示電影詳細資料(Modal)
function showMovieModal(id){
  const modal_title = document.querySelector('#movie_modal_title')
  const modal_image = document.querySelector('#movie_modal_image')
  const modal_date = document.querySelector('#movie_modal_date')
  const modal_des = document.querySelector('#movie_modal_des')

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

// 將電影在Favorite刪除
function removeFromFavorite(id){
  if (!movies || !movies.length) return //判斷movies 陣列資料是否是空的
  const movie_index = movies.findIndex(movie => movie.id == id) // 用findIndex()找到相對應id的index
  if(movie_index === -1) return //若找不到相對應的id資料則會回傳-1

  movies.splice(movie_index,1)
  localStorage.setItem('favorites', JSON.stringify(movies))
  renderMovieList(movies)

}

//GET Favorite電影資料
renderMovieList(movies)

// 建立電影清單監聽事件
data_panel.addEventListener('click', function onPanelClicked(event){
  if(event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  }
  else if(event.target.matches('.btn-remove-favorite')){
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

