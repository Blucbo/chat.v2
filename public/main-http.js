document.addEventListener("DOMContentLoaded", function() {

    const modal = document.getElementById('myModal');

    function hideModal() {
        modal.style.display = "none";
    }

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

    const btnSendUser = document.querySelector('[data-elem=send]');
    btnSendUser.addEventListener('click', send, {passive: true});
    
    function save() {
        const name = document.querySelector('[data-elem=name]').value;
        const nickname = document.querySelector('[data-elem=nickname]').value;
        console.log(name, nickname);
        /// post req

        ajaxRequest({
            method: 'POST',
            url: 'api/chat',
            data: {name, nickname},
            callback: (data) => {
                hideModal();
                Object.assign(USER, data);
                renderTitle(USER);
                setInterval(() => {
                    checkStatus(USER.id);
                }, 1000);
            }
        })
    }

    function send() {
        const data = {
            msg: text.value,
            nickname: USER.nickname
        };

        ajaxRequest({
            method: 'POST',
            url: 'api/chat/messages',
            data: data
        });
    }

    function getUsersAndRenderList(id) {
        ajaxRequest({
            method: 'GET',
            url: `api/chat/users/${id}`,
            callback: (data) => {
                renderUserList(data);
            }
        });
    }

    function renderUserList(arr) {
        usersList.innerHTML = '';
        usersList.appendChild(getDoneList(arr, getTemplateUser, 'li'))
    }

    function checkStatus(id) {
        ajaxRequest({
            method: 'GET',
            url: `api/chat/status/${id}`,
            callback: (isChanged) => {
                if (isChanged.users) {
                    getUsersAndRenderList(id);
                }

                if (isChanged.messages) {
                    getMesgsAndRenderList(id);
                }
            }
        });
    }

    function getMesgsAndRenderList(id) {
        ajaxRequest({
            method: 'GET',
            url: `api/chat/messages/${id}`,
            callback: (data) => {
                renderMesgsList(data);
            }
        });
    }

    function renderMesgsList(arr) {
        mesgsList.innerHTML = '';
        mesgsList.appendChild(getDoneList(arr, getTemplateMsg, 'li'))
    }


    function renderTitle({name, nickname}) {
        document.querySelector('[data-elem=title-name]').innerHTML = name;
        document.querySelector('[data-elem=title-nickname]').innerHTML = nickname;
    }

    function getDoneList(arr, fnTemplate, createElem = 'div', classElem = 'clearfix') {
        const fragment = document.createDocumentFragment();
        arr.reduce(function(fragment, current) {
            const template = document.createElement(createElem);
            template.classList.add(classElem);
            template.innerHTML = fnTemplate(current);
            fragment.appendChild(template);
            return fragment;
        }, fragment);
        return fragment;
    }

    function getTemplateMsg({nickname, msg}) {
        const reg = '@' + USER.nickname;
        const classForNotified = (msg.search(reg) != -1) ? 'notified' : '';

        return `<div class="message-data">
                    <span class="message-data-name">${nickname}</span>
                </div>
                <div class="message my-message ${classForNotified}">
                    ${msg}
                </div>`;
    }

    function getTemplateUser({name, nickname}) {
        return `<div class="about">
                        <div class="name">
                            <span class="title">${name}</span>
                            <span class="text">${nickname}</span>
                        </div>
                    </div>`;
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