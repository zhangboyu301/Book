// scroll 内部的容器
let itemList = document.querySelector('#phoneNameContainer')
// 第一次数据渲染完毕，但还未进入可视区 
// 除去其他影响，计算容器初始距离顶部的偏移量。 


// 懒加载相关
const lazyIO = new IntersectionObserver(cb)
function cb(enters) {
    for (let el of enters) {
        if (el.intersectionRatio > 0) { //与可视区发生交汇在处理
            let imgDiv = el.target.querySelector("img")
            // 可设置为回调函数
            setTimeout(() => {
                imgDiv.classList.add('appear')
                imgDiv.classNmae += 'appearfade'
                imgDiv.setAttribute('src', imgDiv.attributes['data-src'].value)
            }, 300)
            lazyIO.unobserve(el.target)
        }
    }
}
// 对元素践行监听
for (let el of itemList.children) {
    lazyIO.observe(el);
}


// 无限滚动， 长列表优化  
// 需要抽取初始化相关的一些配置
let paddingTop = document.querySelector('#padding-top')
let paddingBottom = document.querySelector('#padding-bottom')
let loadingBottom = document.querySelector('#bottom-loading')
// 最外层容器
const scrollWrap = document.querySelector('#scroll')

// 尝试初始化
let initScrollConOffsetTop = document.querySelector('#phoneNameContainer').offsetTop;
let initScrollConOffsetBottom = document.querySelector('#padding-bottom').offsetTop - initScrollConOffsetTop;
let offsetHeight = scrollWrap.offsetHeight; //容器的实际高度
console.log(initScrollConOffsetTop, offsetHeight)



class InfintyCache {
    constructor() {

        /**
         *  [头部栈]  <---->  [要显示元素双端队列]  <---->  [尾部栈]
         *                            ↑
         *                            ↓
         *                [ 记录每一此渲染元素高度的栈 ]
         */

        this.topCache = [];// 头部栈 
        this.bottomCache = []; // 尾部栈
        this.currentCache = []; //只有保留两个元素，双向队列
        this.offsetStack = [] // 每块的高度高度的栈
        this.offsetStack.currentHeight = 0;
    }

    // 触发顶部观察线条
    scrollToTop() {
        // 顶部有值？拉出值，渲染 ：到达顶部
        let topCache = this.topCache;
        // 有元素置换才需要计算偏移量
        if (topCache.length) {
            // 顶部有缓存直接使用顶部的缓存
            this.currentToBottomCache(topCache.pop())

            // 重新渲染当前元素  
            // 如果是 UI 框架，可以考虑移除此步骤。
            infintyCache.renderCurrentCache()
            // 注意顺序，渲染完成之后才能重新计算数据
            // 将偏移量推入缓存并重新计算偏移位置
            infintyCache.popOffset()
        } else {
            // 到顶部，可系列操作
            console.log('到顶啦1')
        }
    }
    // 触发底部观察线条
    scrollToEnd() {
        let bottomCache = this.bottomCache;
        if (bottomCache.length) { // 底下有上面比有
            this.currentToTopCache(bottomCache.pop())
        } else {
            // 下拉加载，加载数据
            let data = randomCreater.createList(8)
            // 显示队列是否要发生置换
            if (this.currentCache.length < 2) {
                this.currentCache.push(data)
            } else {
                this.currentToTopCache(data)
            }
        }

        // 重新渲染当前元素 
        infintyCache.renderCurrentCache()
        // 注意顺序，渲染完成之后才能重新计算元素高度 
        infintyCache.pushOffset(itemList.offsetHeight)
    }


    // 根据偏移栈的数据来更改滚动条或占位元素的偏移或
    popOffset() {
        let stack = this.offsetStack
        console.log(stack)
        if (stack.length > 2) {
            // 底部增高，顶部减少
            paddingTop.style.height = (paddingTop.offsetHeight - stack[stack.length - 3]) + 'px';
            paddingBottom.style.height = (paddingBottom.offsetHeight + stack[stack.length - 1]) + 'px';
            this.offsetStack.currentHeight -= stack[stack.length - 1]
            stack.pop()
        } else {
            console.log('到顶啦2')
        }
    }
    pushOffset(offset) { // 推入的是 currentHeight 总长度
        let stack = this.offsetStack

        if (stack.length == 0) {
            stack.push(offset)
        } else {
            stack.push(offset - stack[stack.length - 1])
        }

        console.log("栈内记录块元素高度：", stack)
        if (stack.length > 2) {
            // 上盒子 paddingTop 的占位
            paddingTop.style.height = (paddingTop.offsetHeight + stack[stack.length - 3]) + 'px'
            // 下盒子减去之前的占位，因为数据一致，占用位置相同
            paddingBottom.style.height = (paddingBottom.offsetHeight - stack[stack.length - 1]) + 'px';
            // console.log(paddingTop.style.height, scrollWrap.scrollTop.toFixed(2)) // 有浮点数可能不准确
            console.log('修改前 scrollTop 偏移：', scrollWrap.scrollTop)
            // 内部元素除当前元素加起来 - 初始偏移量 + 可视高度
            console.log(this.offsetStack.currentHeight, initScrollConOffsetTop, offsetHeight)
            scrollWrap.scrollTop = this.offsetStack.currentHeight + initScrollConOffsetTop + initScrollConOffsetBottom - offsetHeight;
            // 滚动条上移当新加入元素的距离（因为部有占位，下边有新加，所以滚动条一直在底部） 
            console.log('修改后 scrollTop 偏移：', scrollWrap.scrollTop)
        }

        // 增加总长
        this.offsetStack.currentHeight += stack[stack.length - 1]
    }

    // 和当前渲染队列元素发生置换
    currentToTopCache(data) {
        this.topCache.push(this.currentCache.shift())
        this.currentCache.push(data)
    }
    currentToBottomCache(data) {
        this.bottomCache.push(this.currentCache.pop())
        this.currentCache.unshift(data)
    }

    // 渲染当前要显示的页面元素
    renderCurrentCache() {
        // 空值处理
        let top = infintyCache.currentCache.length >= 1 ? infintyCache.currentCache[0] : [],
            bottom = infintyCache.currentCache.length >= 2 ? infintyCache.currentCache[1] : [];
        let renderList = top.concat(bottom)

        console.log("渲染队列：", renderList)
        console.log("缓冲栈：", this.topCache, this.bottomCache, this.offsetStack)
        phoneNameUpadte.updateInnerHtml(renderList)
    }
}



// 触发监听
const infintyCache = new InfintyCache()

function infintyTopCB(enters) {
    for (let el of enters) {
        if (el.intersectionRatio > 0) { //与可视区发生交汇在处理
            console.log('scrollToTop----------------------')
            infintyCache.scrollToTop()
            for (let el of itemList.children) {
                lazyIO.observe(el);
            }
        }
    }
}



function infintyBottomCB(enters) {
    // 初始化
    if (!initScrollConOffsetTop) {
        initScrollConOffsetTop = document.querySelector('#phoneNameContainer').offsetTop;
        initScrollConOffsetBottom = document.querySelector('#padding-bottom').offsetTop - initScrollConOffsetTop;
        offsetHeight = scrollWrap.offsetHeight;//容器的实际高度
        console.log("初始化:", initScrollConOffsetTop, initScrollConOffsetBottom, offsetHeight)
        
    } 

    for (let el of enters) {
        console.log(infintyCache.bottomCache.length ? 0 : 1000)
        setTimeout(() => {
            if (el.intersectionRatio > 0) { //与可视区发生交汇在处理 
                console.log('scrollToEnd----------------------')
                infintyCache.scrollToEnd()
                infintyTop.observe(paddingTop)
                for (let el of itemList.children) {
                    lazyIO.observe(el);
                }
            }
        }, infintyCache.bottomCache.length ? 0 : 800)
    }
}
const infintyTop = new IntersectionObserver(infintyTopCB)
const infintyBottom = new IntersectionObserver(infintyBottomCB)
infintyBottom.observe(loadingBottom)
infintyTop.observe(paddingTop)


// // 停止观察
// io.unobserve(element);

// // 关闭观察器
// io.disconnect();



// offsetHright 不能获取精确的数组，可以尝试使用 scroll + parseFloat 解决


function caclute(num1, num2, oper) {
    let operator = {
        '+': (((num1.toFixed(5) * 10000) + (num2 * 10000)) / 10000).toFixed(0),
        '-': (((num1.toFixed(5) * 10000) - (num2 * 10000)) / 10000).toFixed(0)
    }
    return operator[oper]
}