document.addEventListener("DOMContentLoaded", function() {
    // const socket = io.connect();
    const socket = io('http://localhost:4200');
    const TYPING_TIMER_LENGTH = 500;
    let userId;
    let typing = false;
    let lastTypingTime;
    console.log(socket.id); // undefined

    socket.on('connect', () => {
        userId = socket.id;
        console.log(socket.id); // 'G5p5...'
    });
    const USER = {
        id: null,
        name: null,
        nickname: null
    };

    const usersList = document.querySelector('[data-elem=users-list]');
    const mesgsList = document.querySelector('[data-elem=msg-list]');
    const text = document.querySelector('[data-elem=message]');

    const btnSaveUser = document.querySelector('[data-elem=save]');
    btnSaveUser.addEventListener('click', save, {once: true, passive: true});

    const inputMessage = document.querySelector('[data-elem=message]');
    inputMessage.addEventListener('keydown', updateTyping);
    function updateTyping() {
        if (!typing) {
            typing = true;
            socket.emit('typing', USER);
            console.log('typing');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(() => {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                console.log('stop typing');
                socket.emit('stop typing', USER);
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    }

    const btnSendUser = document.querySelector('[data-elem=send]');
    btnSendUser.addEventListener('click', send, {passive: true});

    socket.on('get user', (data) => {
        console.log('get user', data);
        Object.assign(USER, data);
        renderTitle(USER);
    });


    let timerId;
    socket.on('get users', (data) => {
        clearTimeout(timerId);
        console.log('get users', data);
        renderUserList(data);
        timerId = setTimeout(() => {
            renderUserList(data);
        }, 1000 * 60);
    });

    socket.on('get message', (mesg) => {
       renderMesgsList([mesg], false)
    });

    socket.on('get messages', (mesgs) => {
        renderMesgsList(mesgs)
    });

    socket.on('typing', (user) => {
        console.log('t', user);
    });

    socket.on('stop typing', (user) => {
        console.log('stop t', user);
    });

    function save() {
        const name = document.querySelector('[data-elem=name]').value;
        const nickname = document.querySelector('[data-elem=nickname]').value;
        console.log(name, nickname);
        const user = {name, nickname};
        socket.emit('create user', userId, user);
        /// post req

        // ajaxRequest({
        //     method: 'POST',
        //     url: 'api/chat',
        //     data: {name, nickname},
        //     callback: (data) => {
        //         Object.assign(USER, data);
        //         renderTitle(USER);
        //         setInterval(() => {
        //             checkStatus(USER.id);
        //         }, 1000);
        //     }
        // })
    }

    function send() {
        const msg = {
            msg: text.value,
            nickname: USER.nickname
        };
        socket.emit('new message', msg);
        // ajaxRequest({
        //     method: 'POST',
        //     url: 'api/chat/messages',
        //     data: data
        // });
    }
    //
    // function getUsersAndRenderList(id) {
    //     ajaxRequest({
    //         method: 'GET',
    //         url: `api/chat/users/${id}`,
    //         callback: (data) => {
    //             renderUserList(data);
    //         }
    //     });
    // }

    function renderUserList(arr) {
        usersList.innerHTML = '';
        usersList.appendChild(getDoneList(arr, getTemplateUser, 'li'))
    }

    // function checkStatus(id) {
    //     ajaxRequest({
    //         method: 'GET',
    //         url: `api/chat/status/${id}`,
    //         callback: (isChanged) => {
    //             if (isChanged.users) {
    //                 getUsersAndRenderList(id);
    //             }
    //
    //             if (isChanged.messages) {
    //                 getMesgsAndRenderList(id);
    //             }
    //         }
    //     });
    // }

    // function getMesgsAndRenderList(id) {
    //     ajaxRequest({
    //         method: 'GET',
    //         url: `api/chat/messages/${id}`,
    //         callback: (data) => {
    //             renderMesgsList(data);
    //         }
    //     });
    // }

    function renderMesgsList(arr, isClear = true) {
        if (isClear) {
            mesgsList.innerHTML = '';
        }
        mesgsList.appendChild(getDoneList(arr, getTemplateMsg, 'li'))
    }


    function renderTitle({name, nickname}) {
        document.querySelector('[data-elem=title-name]').innerHTML = name;
        document.querySelector('[data-elem=title-nickname]').innerHTML = nickname;
    }

    function getDoneList(arr, fnTemplate, createElem = 'div') {
        const fragment = document.createDocumentFragment();
        arr.reduce(function(fragment, current) {
            const template = document.createElement(createElem);
            template.innerHTML = fnTemplate(current);
            return fragment.appendChild(template);
        }, fragment);
        return fragment;
    }

    function getTemplateMsg({nickname, msg}) {
        const reg = '@' + USER.nickname;
        const classForNotified = (msg.search(reg) != -1) ? 'notified' : '';

        return `<span class="title">${nickname}</span> 
                <span class="text ${classForNotified}">${msg}</span>`;
    }

    function getTemplateUser({name, nickname, status, lastVisit}) {
        const labelActivity = getActivity(status, lastVisit);
        return `<span class="label">${labelActivity }</span> 
                <span class="title">${name}</span> 
                <span class="text">${nickname}</span>`;
    }

    function getActivity(status, date) {
        const now = new Date().getTime();
        const interval = 1000 * 60;
        if (status === 'online') {
            console.log('date', now - date > interval);
            return (now - date > interval) ? 'online' : 'just appeared';
        }

        if (status === 'offline') {
            console.log('date', now - date > interval);
            return (now - date > interval) ? 'offline' : 'just left';
        }
    }

    function ajaxRequest(options) {
        const url = options.url || '/';
        const method = options.method || 'GET';
        const callback = options.callback || function () {};
        const data = options.data || {};
        const xmlHttp = new XMLHttpRequest();

        xmlHttp.open(method, url, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(JSON.stringify(data));

        xmlHttp.onreadystatechange = () => {
            if(xmlHttp.status == 200 && xmlHttp.readyState === 4) {
                callback(JSON.parse(xmlHttp.responseText))
            }
        }
    };


});