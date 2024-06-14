'use strict'

// создаем тег <canvas> (нужен для отрисовки графики)
const canvas = document.createElement("canvas")
// получаем доступ к контексту <canvas> для отрисовки графики
const context = canvas.getContext("2d")
// вставляем <canvas> в тег <body> нашего сайта
document.body.append(canvas)

// задаем размеры тегу <canvas>
canvas.width = 1920
canvas.height = 960

// задаем размеры "комнаты", на которой будут спрятаны предметы
const roomWidth = 1920
const roomHeight = 840
// задаем отступы для отрисовки комнаты
const roomOffsetX = 0
const roomOffsetY = 120
// в переменной roomImage будем хранить масштабированное изображение комнаты (пока его нет)
let roomImage = null
//это 60 секунд
let time = 60*1000
// объект View содержит информацию о экране устройства
const View={
    width: innerWidth, // ширина
    height: innerHeight,// высота
    offsetX: 0, // горизонтальный отступ (что бы <canvas> был отцентрирован горизонтально)
    offsetY: 0, // вертикальный отступ (что бы <canvas> был отцентрирован горизонтально)
    rate: 0.5, // соотношение ширины и высоты <canvas> (960 / 1920 = 0,5)
    scale: 1, // определяем масштаб, для расчета кликов
}

// событие onresize - сработает при изменении размеров экрана (например поворот телефона)
// updateView - функция, которая будет вызвана при наступлении события "изменение размеров экрана"
onresize = updateView

function updateView(){
    // пересчитываем соотношение сторон экрана
    const Width = (innerWidth * View.rate > innerHeight) ? innerHeight / View.rate : innerWidth
    const Height = Width * View.rate
    // обновляем данные объекта View
    View.scale = canvas.width / innerWidth
    View.width = Width 
    View.height = Height
    View.offsetX = (innerWidth - Width) * 0.5
    View.offsetY = (innerHeight - Height) * 0.5
    // вписываем <canvas> в размер экрана пользователя
    canvas.style.width = Width + 'px'
    canvas.style.height = Height + 'px'
}
// вызываем стартовый расчет размеров <canvas>, что бы вписать его в экран пользователя
updateView()

///////////////////////////////////////////////////////////

// указываем путь к изображениям и звукам
const IMAGES_PATH = './src/images/'
const SOUNDS_PATH = './src/sounds/'

const MUSIC_LIST = ['bgm_1.mp3', 'bgm_1.mp3'] // список фоновых треков
MUSIC_LIST.sort(()=>Math.random() - 0.5) // перемешиваем все треки
let isMusicStart = false
function playBGMusic() {
    new Audio(SOUNDS_PATH + MUSIC_LIST[0]).play()
}

// создаем массив, с названиями изображений для загрузки (если изображение не загрузить - его нельзя рисовать на <canvas>)
const IMAGES_TO_UPLOAD = [
    'key.png', 'cat.png', 'eat.png', 'note.png', 'computer.png', 'broom.png', 'pomade.png', 'pillows.png', 'strawberry.png', 'toy.png',
    'room1.jpg', 'room2.jpg', 'room3.jpg', 'room4.jpg','pers315x756.png'
]
// создаем массив, с названиями звуковых эффектов (SOUND EFFECTS) для загрузки
const SOUNDS_TO_UPLOAD = ['se_win.mp3', 'se_error.mp3']

// создаем пустой объект, в который будем сохранять загруженные изображения
const IMG = {}
// создаем пустой объект, в который будем сохранять загруженные звуки
const SE = {}

// считаем сколько всего файлов нам необходимо загрузить (сумма длин массивов картинок и звуков)
let uploadSize = IMAGES_TO_UPLOAD.length + SOUNDS_TO_UPLOAD.length
let uploadStep = 0 // в переменной uploadStep - число файлов (изображений и звуков) которые уже загружено

IMAGES_TO_UPLOAD.forEach( data => uploadImages(data) ) // вызываем для каждой картинки функцию uploadImages
SOUNDS_TO_UPLOAD.forEach( data => uploadSounds(data) ) // вызываем для каждого звука функцию uploadSounds

// функция загрузки изображений
function uploadImages(imageName){
    IMG[imageName] = new Image() // в объект IMG по ключу imageName создаем пустое изображение, с помощью класса Image
    IMG[imageName].src = IMAGES_PATH + imageName // указываем путь к данному изображению
    IMG[imageName].onload = () => updateLoadingProgress() // кода оно загрузиться - вызовем функцию updateLoadingProgress
}

// функция загрузки звуков
function uploadSounds(SoundName){
    SE[SoundName] = new Audio() // в объект IMG по ключу SoundName создаем звук, с помощью класса Audio
    SE[SoundName].src = SOUNDS_PATH + SoundName // указываем путь к файлу со звуком
    SE[SoundName].oncanplaythrough = (e) => { // когда звук загрузиться полностью (готов проиграться от начала до конца)
        e.target.oncanplaythrough = null // отключаем его автоматическое проигрывание (что бы он не включился сразу же)
        updateLoadingProgress() // и вызовем функцию updateLoadingProgress
    }
}

// функция обновления состояния загрузки файлов (звуков и изображений)
function updateLoadingProgress(){
    uploadStep++ // увеличиваем на 1 счетчик загруженных файлов
    // если число загруженных файлов равно числу всех файлов, которые необходимо было загрузить - вызываем функцию loadingDone
    if (uploadStep === uploadSize) loadingDone()
}

// функция завершения загрузки всех файлов (звуков и изображений)
function loadingDone(){
    updateView()
    // генерируем изображение комнаты (функция generateBackground запишет его в переменную roomImage)
    generateBackground(IMG['room4.jpg'])

    // список предметов в комнате
    items = [
        //        image, width, height, x, y
        new Item(IMG['key.png'], 90, 30, 1500, 520),
        new Item(IMG['cat.png'], 130, 100, 1150, 350),
        new Item(IMG['note.png'],80 ,80,600,800),
        new Item(IMG['toy.png'], 60 ,80,650,620),
        new Item(IMG['broom.png'],130 ,300,250,600),
    ]

    items.forEach(item=> menuItemList.push ( new MenuItem(item.img)))

    // запускаем обновление экрана
    animation()
}

////////////////////////////////////////////////////////////

// функция задания картинки с комнатой определенного размера
function generateBackground(img){
    // создаем отдельный <canvas> с размерами комнаты (он и будет служить изображением комнаты)
    roomImage = document.createElement('canvas')
    roomImage.width = roomWidth
    roomImage.height = roomHeight
    const roomContext = roomImage.getContext('2d') // получаем контекст для отрисовки картинки img

    // рассчитываем масштаб для картинки img, что бы вписать её в размеры <canvas> (roomImage)
    let scaleX = roomWidth / img.width  // 1600 / 1200 = 1.33   1600 / 1900 = 0.84
    let scaleY = roomHeight / img.height // 800 / 600 = 1.33    800 / 1200 = 0.67
    // находим максимальный коэффициент масштабирования
    let scale = Math.max(scaleX, scaleY)

    // рассчитываем размеры смасштабированного изображения img
    const imgScaledWidth = img.width * scale
    const imgScaledHeight = img.height * scale

    // рассчитываем отступы для изображения комнаты, что бы оно отцентрировалось в <canvas> (roomImage)
    let offsetX = (roomWidth - imgScaledWidth) / 2
    let offsetY = (roomHeight - imgScaledHeight) / 2

    // отрисовывает смасштабированное изображение комнаты  
    roomContext.drawImage(img, offsetX, offsetY, imgScaledWidth, imgScaledHeight)
}

// класс для работы с текстом
class TextImage {
    constructor(text = '', x = 0, y = 0, size = 24, align = 'left', color = 'rgb(0, 0, 0)') {
        this.x = x
        this.y = y
        this.weight = 'normal' // 'normal', 'bold'
        this.style = 'italic' // 'normal', 'italic'
        this.size = size
        this.family = 'Arial'
        this.color = color
        this.align = align // 'left', 'center', 'right'
        this.offsetX = 0;
        this.font = `${this.weight} ${this.style} ${this.size}px ${this.font}, Arial, sans-serif`
        this.img = document.createElement('canvas')
        this.ctx = this.img.getContext('2d')
        this.img.width = this.getTextWidth(text)
        this.img.height = this.size

        this.render(text)
    }

    // определение ширины canvas для отрисовки текста
    getTextWidth(text) {
        this.ctx.font = this.font
        return this.ctx.measureText(text || ' ').width
    }

    // Обновление текста
    render(text) {
        this.ctx.clearRect(0, 0, this.img.width, this.img.height)
        this.img.width =  this.getTextWidth(text)

        if (this.align === 'right') this.offsetX = this.img.width
        else if (this.align === 'center') this.offsetX = Math.floor(this.img.width / 2)

        this.ctx.font = this.font
        this.ctx.textBaseline = 'top'
        this.ctx.textAlign = this.align
        this.ctx.fillStyle = this.color
        this.ctx.fillText(text || ' ', this.offsetX, 0)
    }

    // Отрисовка текста
    draw() {
        context.drawImage( this.img, this.x - this.offsetX, this.y)
    }
}

// класс для предметов в комнате
class Item {
    constructor(img, width, height, x, y) {
        this.img = img
        this.width = width
        this.height = height
        this.x = x
        this.y = y
        this.isExist=true
    }

    checkClick(x, y) {
        let isokey=false
        if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
            this.isExist=false
            menuItemList.forEach(item=> {
                if (item.img.src===this.img.src) {
                    item.isExist=false
                    isokey=true
                }
            })
        }
        if(isokey){
          SE['se_win.mp3'].play() 
        }
        else {
            SE['se_error.mp3'].play() 
        }
    
    }

    draw() {
        context.drawImage(this.img, this.x, this.y, this.width, this.height)
    }
}

const menuItemOffsetX=500
class MenuItem {
    constructor(img) {
        let scale=80/img.height
        this.img = img
        this.width = img.width*scale
        this.height = img.height*scale
        this.y = 20
        this.isExist=true
    }

    draw(x) {
        context.drawImage(this.img, x, this.y, this.width, this.height)
    }
}
let menuItemList=[]

function drawMenuItems(){
    let x=menuItemOffsetX
    menuItemList.forEach(item=>{
        item.draw(x)
        x+=item.width+20
    })
}

let points = []
class Point {
    constructor(x, y, isCircle = false) {
        this.x = x
        this.y = y
        this.isCircle = isCircle
        this.maxSize = 60
        this.step = 0.6
        this.size = 0
        this.alphaStep = Number((1 / (this.maxSize / this.step)).toFixed(2))
        this.alpha = 1

        this.isExist = true
        points.push(this)
    }

    update() {
        this.alpha -= this.alphaStep
        this.size += this.step
        if (this.size > this.maxSize) return this.isExist = false

        if (this.isCircle) {
            context.fillStyle = `rgba(0, 255, 0, ${this.alpha})`
            context.beginPath()
            context.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
            context.fill()
        } else {
            context.strokeStyle = `rgba(255, 255, 0, ${this.alpha})`
            context.beginPath()
            context.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
            context.stroke()
        }
    }
}

function getClick(event) { console.log(event)
    const rect = event.target.getBoundingClientRect()
    const x = event.offsetX * View.scale
    const y = event.offsetY * View.scale
    console.log(x, y, rect)

    new Point(x, y, true)

    if(items.length){
        items.forEach(item=>item.checkClick(x,y))
    }

    if (isMusicStart === false) {
        isMusicStart = true
        playBGMusic()
    }
}

function getMouseMove(event) {
    mouseMoveEffectSteps--
    if(mouseMoveEffectSteps > 0) return 
    
    mouseMoveEffectSteps = mouseMoveEffectDelay

    const x = event.offsetX * View.scale
    const y = event.offsetY * View.scale
    new Point(x, y)
}

////////////////////////////////////////////////////////////////////

//                               text,                              x,  y, size, align,   color
const taskText = new TextImage('Найди предметы:', 20, 20, 50, 'left', 'rgb(199, 185, 165 )' )
const timeText = new TextImage(`Время : ${(time/1000).toFixed()} секунд`, canvas.width-20, 20, 50, 'right', 'rgb(199, 185, 165 )' )
const finalText = new TextImage('Время вышло', canvas.width*0.5, canvas.height*0.5, 150, 'center', 'rgb(139, 69, 19)' )
// список предметов в комнате
let items = []


  
canvas.onclick = getClick // при клике по <canvas> вызываем функцию getClick

const mouseMoveEffectDelay = 5
let mouseMoveEffectSteps = mouseMoveEffectDelay
canvas.onmousemove = getMouseMove 

////////////////////////////////////////////////////////////////////
let isTimeStart=false
// функция обновления экрана (перерисовки графики в теге <canvas>)
function animation(timeStemp){
    if (isTimeStart===false && timeStemp) {
        time = timeStemp + time
     isTimeStart=true
  
    }
    let timeout = Math.ceil((time-timeStemp)/1000)
    context.clearRect(0, 0, canvas.width, canvas.height) // стираем все что было нарисовано в теге <canvas>
    context.fillStyle = 'rgba(0, 0, 0, 0.75)' // задаем цвет заливки (Red = 0, Green = 0, Blue = 0, alpha = 0.75% - прозрачность)
    context.fillRect(0, 0, canvas.width, canvas.height) // рисуем прямоугольник залитый заданным цветом (координата X, Y, ширина, высота)
    context.drawImage(roomImage, roomOffsetX, roomOffsetY) // рисуем картинку roomImage в координатах X и Y

    items.forEach( item => item.draw() )

    taskText.draw()
    drawMenuItems()
    timeText.render(`Время : ${timeout} секунд`)
    timeText.draw()

    items=items.filter(item=> item.isExist)
    menuItemList=menuItemList.filter(item=> item.isExist)
    if(items.length===0) return gameEnd (true,timeout)


    context.drawImage(IMG['pers315x756.png'],canvas.width-315,canvas.height-756)
    points.forEach(point => point.update())
    
    if (timeout>0||isNaN(timeout)) requestAnimationFrame(animation) // просим браузер при следующем обновлении экрана вызвать функцию animation()
    else gameEnd (false, 0)
}


function gameEnd(iswin,timeout){
    context.clearRect(0, 0, canvas.width, canvas.height) // стираем все что было нарисовано в теге <canvas>
    context.fillStyle = 'rgba(0, 0, 0, 0.75)' // задаем цвет заливки (Red = 0, Green = 0, Blue = 0, alpha = 0.75% - прозрачность)
    context.fillRect(0, 0, canvas.width, canvas.height) // рисуем прямоугольник залитый заданным цветом (координата X, Y, ширина, высота)
    context.drawImage(roomImage, roomOffsetX, roomOffsetY) // рисуем картинку roomImage в координатах X и Y

    taskText.draw()
    drawMenuItems()
    timeText.render(`Время : ${timeout} секунд`)
    timeText.draw()

    context.drawImage(IMG['pers315x756.png'],canvas.width-315,canvas.height-756)
    if (iswin) finalText.render ('Предметы найдены')
    finalText.draw()
}
