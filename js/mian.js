let data = [ 
    { "id": 1, "name": "老刘", "number": 1235488996 },
    { "id": 2, "name": "难寻", "number": 1385426982 },
    { "id": 3, "name": "闲置", "number": 8123365478 },
    { "id": 4, "name": "老刘", "number": 1235488996 },
    { "id": 5, "name": "难寻", "number": 1385426982 },
    { "id": 6, "name": "闲置", "number": 8123365478 },
    { "id": 7, "name": "老刘", "number": 1235488996 },
    { "id": 8, "name": "嘘声", "number": 5555555214 },
    { "id": 9, "name": "时期", "number": 2544885562 },
    { "id": 10, "name": "用了", "number": 2221458896 },
    { "id": 15, "name": "老猪", "number": 3355522336 },
    { "id": 12, "name": "小胖", "number": 3366222252 },
    { "id": 13, "name": "肥肥", "number": 2542366681 },
    { "id": 15, "name": "小王", "number": 2225588846 },
    { "id": 16, "name": "小李", "number": 2225585646 },
    { "id": 17, "name": "小强", "number": 2225585846 },
    { "id": 18, "name": "小李", "number": 2225585646 },
    { "id": 19, "name": "小强", "number": 2225585846 },
    { "id": 20, "name": "小李", "number": 2225585646 }  
]
 
const utils = {
    get: (name) => {
        return JSON.parse(localStorage.getItem(name))
    },
    set: (name, value) => {
        return localStorage.setItem(name, JSON.stringify(value))
    }
} 

// 节流
function throttle(cb, time){
    let run = false; 
    return function(...args){
        if(!run){
            run = true;
            cb.apply(this,args)
            setTimeout(()=>{
                run = true;
            },time * 1000)
        }
    }
} 
// 防抖
function debounce(cb,time){
    let timer;
    return function(...args){
        let context = this; 
        if(timer){
            clearTimeout(timer) 
        } 
        timer = setTimeout(()=>{ 
             cb.apply(context,args)
        }, time * 1000)
    }
}
 





function setCacheData(phoneNumber){
    console.log('统一更新缓存数据写入一次')
    utils.set('phoneNumber', phoneNumber)
} 
let debounceSetCacheData = debounce(setCacheData,3) 
// js 缓存电话簿
let phoneNumber = []
phoneNumber = utils.get('phoneNumber') || []
phoneNumber = new Proxy(phoneNumber, {
    set(obj, key, value) { 
        if(key == 'length') return value 
        obj.push(value)
        console.log('update')   
        debounceSetCacheData(phoneNumber)
        return value
    }
})



// 唯一 id
class CreateUid {
    constructor() {
    }
    getUid(arrs) {  
        arrs = arrs || utils.get('phoneNumber') || []
        let uid = arrs[arrs.length - 1] ? arrs[arrs.length - 1].id + 1: 0 
        return  uid ? uid : 0;
    }
}
let createUid = new CreateUid()


// 为了测试长列表，随机生成列表数据，和离线缓存发生重复
class RandomCreater{
    constructor(){
        this.uid = createUid.getUid()
    }
    createList(num){
        num = num || 10 
        let copy = num;
        let res = [];
        while(num -- ){
            res.unshift(
                { "id": this.uid + num + 1 , 
                "name": "小强 " + ( this.uid + num) , 
                "number": 2225585846,
                'desc':"为了撑开不同的高度，哈哈；".repeat(Math.random() * 5)} 
            )
        }  
        this.uid += copy;     
        phoneNumber.push(...res) 
        return res;
    }
}
let randomCreater = new RandomCreater() 
class PhoneNameUpadte {
    constructor() {
        this.phoneNameContainer = document.querySelector('#phoneNameContainer') 
    } 
    updateInnerHtml(list){
        let htmlStr = ''
        console.log(list)
        list.forEach(item => {
            htmlStr +=
            `<div  class="item" id="itemList">
                <div class="img">
                     ${item.name[0]}
                     <img class="p-img" data-src="https://www.w3school.com.cn/ui2017/compatible_chrome.png"/>
                </div> 
                <div class="number">${item.name} <span>: ${item.number}</span><div>${item.desc}</div></div> 
                <div class="edit">
                    <input name="confim" id="${item.id}" class="buttonDefault" style="border-color: #00C853;" type="button" value="✎"> 
                    <input name="delete" id="${item.id}" class="buttonDefault" style="border-color: red;" type="button" value="✘"> 
                     
                </div> 
                 
            </div>`
        })  
        this.phoneNameContainer.innerHTML = htmlStr
    }
} 
const phoneNameUpadte = new PhoneNameUpadte()
 

const addPhoneNum = document.querySelector('#addPhoneNum')
//拨号 
addPhoneNum.style.display = 'none'
const key = document.querySelector('#key')
const input = document.querySelector('#input')
const deleteInput = document.querySelector('#deleteInput')
let inputArr = []  // 显示拨号
deleteInput.onclick = function () {
    inputArr.pop()
    if (inputArr.length < 9) {
        addPhoneNum.style.display = 'none'
    }
    input.value = inputArr.join('')


    let number = parseInt(inputArr.join(''))
    let havaIt = phoneNumber.find((item)=>{
        if(item.number === number ){
            return true
        }
    }) 
    if (inputArr.length < 9 || havaIt) {
        addPhoneNum.style.display = 'none'
    }
}
key.addEventListener('click', (e) => {// 点击拨号
    if (e.target.attributes['value']) {
        let value = e.target.attributes['value'].value;

        inputArr.push(value)
         

        console.log(inputArr)
        input.value = inputArr.join('')
        let number = parseInt(inputArr.join(''))

        // 校验
        let havaIt = phoneNumber.find((item)=>{
            if(item.number === number ){
                return true
            }
        }) 
        if (inputArr.length >= 9 && !havaIt) {
            addPhoneNum.style.display = 'block'
        }
    }
})
 


//addPhoneNum  
const notificationNumber = document.querySelector('#notificationNumber')
const phoneNameConfim = document.querySelector('#phoneNameConfim')
const phoneNameCancel = document.querySelector('#phoneNameCancel')
const phoneName = document.querySelector('#phoneName')
addPhoneNum.onclick = function (e) {
    notificationNumber.classList.remove('disappear')
    notificationNumber.classList.add('appear')
}
phoneNameConfim.onclick = function () {
    console.log(phoneNumber)
    if (inputArr.length >= 9 ) {

        let person = {
            id: createUid.getUid(phoneNumber),
            name: phoneName.value,
            number: parseInt(inputArr.join(''))
        }
        let havaIt = phoneNumber.find((item)=>{
            if(item.name === person.name ){
                return true
            }
        })
        console.log(havaIt)
        if(havaIt){
            phoneName.style.color = 'red'
        }else{
            phoneName.style.color = 'black'
            phoneNumber.push(person)
            console.log(phoneNumber) 
            inputArr.length = 0
            input.value = ''
            phoneName.value = ''
            infintyCache.renderCurrentCache()
            addPhoneNum.style.display = 'none'
            notificationNumber.classList.remove('appear')
        }  
    } 
     
}
phoneNameCancel.onclick = function () {
    // input.value = ''
    // addPhoneNum.style.display = 'none'
    notificationNumber.classList.remove('appear')
    notificationNumber.classList.add('disappear')
}



//tab 切换
const phone = document.querySelector('#phone')
const list = document.querySelector('#list')
const tab = document.querySelector('#tab')
tab.addEventListener('click', (e) => {
    if (e.target.attributes['name'] && e.target.className != 'active') {
        // 活动标记 清除
        let len = tab.children.length;
        while (len-- > 0) {
            tab.children[len].classList.remove('active')
        }
        e.target.className = 'active'
        // 显示隐藏 container
        let name = e.target.attributes['name'].value;
        console.log('click:' + name)
        let obj = {
            rest: () => {
                phone.className = 'disappear'
                list.className = 'disappear'
            },
            phone: () => {
                phone.className = 'appear'
            },
            list: () => {
                list.className = 'appear'
            }
        }
        obj.rest()
        obj[name]()
    }
})

const notificationChanegNum = document.querySelector('#notificationChanegNum')
const ChanegphoneName = document.querySelector('#ChanegphoneName')
const ChanegphoneNum = document.querySelector('#ChanegphoneNum')
const changephoneNameCancel = document.querySelector('#changephoneNameCancel')

class Edit {
    constructor() {
        let self = this;
        let obj = {
            'confim': (node, id) => {
                self.update(node, id)
            },
            'delete': (node, id) => {
                self.delete(node, id)
            }
        }
        this.phoneNameContainer = document.querySelector('#phoneNameContainer');
        this.phoneNameContainer.addEventListener('click', (e) => { // 弹框
            console.log(e)
            let node = e.target.parentNode.parentNode;
            let tag = e.target;
            if (tag.nodeName.toLowerCase() == 'input') {
                obj[tag.attributes["name"].value](node, tag.attributes['id'].value)

                let item = phoneNumber.find((item) => {
                    if (item.id == tag.attributes['id'].value) {
                        return item
                    }
                })
                if (item) {
                    ChanegphoneName.value = item.name;
                    ChanegphoneNum.value = item.number;
                }

                console.log(tag.attributes["name"].value, tag.attributes['id'].value)
            }
        })
    }
    delete(node, id) {
        this.phoneNameContainer.removeChild(node)
        let index = phoneNumber.findIndex((item) => {
            console.log(phoneNumber, id, item.id == id)
            return item.id == id
        })

        console.log(index)
        if (index >= 0) {
            phoneNumber.splice(index, 1)
        }
    }
    update(node, id) {
        //  
        notificationChanegNum.classList.remove('disappear')
        notificationChanegNum.classList.add('appear')
        console.log(node, id)
        changephoneNameConfim.onclick = function () {
            console.log(node, id)
            console.log(phoneNumber, ChanegphoneNum.value)
            if (ChanegphoneNum.value.length > 5 && ChanegphoneNum.value.length <= 11) {
                let person = {
                    id: createUid.getUid(phoneNumber),
                    name: ChanegphoneName.value,
                    number: parseInt(ChanegphoneNum.value)
                }
                let findeid = phoneNumber.findIndex((item) => {
                    return item.id == id
                })
                console.log(phoneNumber, person)
                phoneNumber.splice(findeid, 1, person)

                inputArr.length = 0
                ChanegphoneName.value = ''
                ChanegphoneNum.value = ''
                infintyCache.renderCurrentCache()
            }
            notificationChanegNum.classList.remove('appear')
        }

        changephoneNameCancel.onclick = function () {
            input.value = ''
            notificationChanegNum.classList.remove('appear')
            notificationChanegNum.classList.add('disappear')
        }
    }
}
let edit = new Edit()
