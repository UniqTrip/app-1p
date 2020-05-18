
/**
 * Удалить статью
 */
(function(){
  
  //получить все элементы
  let button_list = document.querySelectorAll('.button');

  for(let item of button_list ){
    item.addEventListener('click', function(){
      console.log('клац');
      let id = Number(this.getAttribute('data-article'));
      const obj = {
        'id' : id
      }
      const opt = {
        method : 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      }

      fetch('/delete-article', opt)
        .then((data)=>{
          console.log('пришли данные!')
          return data.json();
        })
        .then((parseData)=>{
          console.log(parseData);
          document.location.reload(true);
        })
        .catch((err)=>{
          console.log(err);
        })

    });
  }

})();


/**
 * Создать статью
 */
(function () {

  const elem = document.getElementById('button');
  let fileInput = document.getElementById("myfileinput");
  let textInput = document.getElementById("text_id");

  elem.addEventListener('click', function () {
    let formData = new FormData();
    console.log(`Текст - ${textInput.value}`);
    const id = textInput.value;
    
    if (!id) {
      //вывести алерт
      console.log('Поле текст пусто!');
      return;
    }

    formData.append('id', id);

    let file = fileInput.files[0];

    if (!file) {
      console.log('Файл не выбран!');
      textInput.value = '';
      return;
    }

    formData.append('file', file);

    let opt = {
      method: 'POST',
      headers: {
        //'Content-Type': 'application/json'
        //'Content-Type': 'application/x-www-form-urlencoded',
        //'Content-Type': ' multipart/form-data' //при использовании FormData проставляется автоматиески
      },
      body: formData
      // 'name=' + encodeURIComponent('vasia') +
      // '&surname=' + encodeURIComponent('ivanow')
      //JSON.stringify(id) 
    };

    fetch('/create-article', opt)
      .then((data) => {
        document.location.reload(true);
      })
      .catch((err) => {
        console.log(err.message);
      })

    document.getElementById("test").innerHTML = document.getElementById("test").innerHTML;

  });

})();


/**
 * Кнопка с особыми правами
 */

 (function(){

  let button = document.getElementById('special');

  button.addEventListener('click', ()=>{
    console.log('Особенный алерт доступный избранным!');
    let text = `secret=${encodeURIComponent('nikogda')}`;
    let opt = {
      method : 'post',
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      body: text
    }

    fetch('/special', opt)
      .then((body)=>{
        return body.text();
        
      })  
      .then(data=>{
        console.log(data); 
        console.log('ответ на супер специальный вопрос');
      })
      .catch(err=>console.log(err))
  })

 })()