/* global navigator, grecaptcha */

//const cdn = `${cdn_url}images`;
const cdn = "https://rdv.nyc3.cdn.digitaloceanspaces.com/tracker/assets/images";
//const cdn = "https://rdv.nyc3.digitaloceanspaces.com/tracker/assets/images";

var plataforma;
var empresa;
var empresaEscolhida;
var empresaMatriz;
var playerId;
var pushToken;
var clearCache = 0;
var share;
var redirect;
var mensagem;
var localhost = location.origin === "http://localhost" ? true : false;

function onlynumbers(value) {
    return value.replace(/\D/g, "");
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

function toggleLoading(ativo) {
    if (ativo) {
        $("#loading-wrapper").fadeIn();
    } else {
        $("#loading-wrapper").fadeOut();
    }
}

function remember() {
    if (getLocalStorage("remember") === "S") {
        let pass_decrypto = desposicionaCSS(getLocalStorage('_ixw_sp_wq'));
        $('#lembrarDeMimId').prop('checked', true);
        $('#auth_user').val(getLocalStorage('user'));
        pass_decrypto = getLocalStorage('pass') ? getLocalStorage('pass') : pass_decrypto; // remover esta linha em agosto 2022 ou posterior
        $('#auth_pw').val(pass_decrypto);

        if (getLocalStorage("logado") === "S" && isAndroidOrIphone()) {
            setTimeout(() => {
               onSubmit("", false); 
            }, 100);            
        }
    } else {
        $('#lembrarDeMimId').prop('checked', false);
        $('#auth_user').val('');
        $('#auth_pw').val('');
    }
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function getURLParameter(parameterName) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == parameterName) {
            return pair[1];
        }
    }
    return "";
}

function checkCookie() {
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled) {
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie") != -1;
    }
    return cookieEnabled;
}

function getCookie(name) {
    var ret = "";
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) {
        ret = parts.pop().split(";").shift();
    }
    return ret;
}

// function setCookie(name, value) {
//     var expiry = new Date();
//     expiry.setTime(expiry.getTime() + (10 * 365 * 24 * 60 * 60 * 1000));
//     document.cookie = name + '=' + value + ';expires=' + expiry.toGMTString() + ';path=/';
// }

function clearCookies() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var equals = cookies[i].indexOf("=");
        var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function getLocalStorage(name) {
    var ret = "";

    if (localStorage) {
        ret = localStorage.getItem(name);
    }

    return ret ? ret : "";
}

function setLocalStorage(name, value) {
    if (localStorage) {
        localStorage.setItem(name, value);
    }
}

function removeLocalStorage(name, value) {
    if (localStorage) {
        localStorage.removeItem(name, value);
    }
}

function clearLocalStorage() {
    removeLocalStorage("remember");
    removeLocalStorage("user");
    removeLocalStorage("pass");
    removeLocalStorage("_ixw_sp_wq");
    removeLocalStorage("empresa");
    removeLocalStorage("boasVindasDashboard");
    removeLocalStorage("ultimos_clientes_pesquisados");
    removeLocalStorage("ultimos_veiculos_pesquisados");
    removeLocalStorage("cor_barra_rdv");
    removeLocalStorage("cor_barra");
    removeLocalStorage("whatsnew");
    removeLocalStorage("idsAutoPush");
    removeLocalStorage("pushToken");
}

function getSessionStorage(name) {
    var ret = "";

    if (sessionStorage) {
        ret = sessionStorage.getItem(name);
    }

    return ret ? ret : "";
}

function setSessionStorage(name, value) {
    if (sessionStorage) {
        sessionStorage.setItem(name, value);
    }
}

function clearSessionStorage() {
    if (sessionStorage) {
        sessionStorage.clear();
    }
}

function removeSessionStorage(name, value) {
    if (sessionStorage) {
        sessionStorage.removeItem(name, value);
    }
}

function setFocusToCpf() {
    document.getElementById("cpf").focus();
}

function removeMessage() {
    $('#output').removeAttr('style').removeAttr("class");
    $('#output').html("");
}

function posicionaCSS(str){
    let key = CryptoJS.enc.Hex.parse("9ac1b5a27bcd4ea4fcaf726f54c36ecd");
    let iv = CryptoJS.enc.Hex.parse("54659d874923e14acb69ec8d51307d8c");
    let encrypted = CryptoJS.AES.encrypt(str, key, {'mode': CryptoJS.mode.CBC, iv: iv}).toString().trim();
    return  encrypted;
}

function desposicionaCSS(str){
    let key = CryptoJS.enc.Hex.parse("9ac1b5a27bcd4ea4fcaf726f54c36ecd");
    let iv = CryptoJS.enc.Hex.parse("54659d874923e14acb69ec8d51307d8c");
    let dencrypted = CryptoJS.AES.decrypt(str, key, {'mode': CryptoJS.mode.CBC, iv: iv}).toString(CryptoJS.enc.Utf8);
    return  dencrypted;
}

function string2Hex(str) {
    var ret = '';
    for(var i = 0; i < str.length; i++) {
        ret += str[i].charCodeAt(0).toString(16);
    }
    return ret;
}

function enviarEmail(token) {

    if (token && token === grecaptcha.getResponse(1)) {

        //Limpa o recaptcha de recuperação de senha
        if (typeof grecaptcha != 'undefined' && grecaptcha) {
            grecaptcha.reset(1);
        }

        var cpf = $('#cpf').val().trim();
        var origem = getLocalStorage('empresa');

        if (cpf === "") {
            $('#output').html("Informe o CPF/CNPJ ou login");
            $('#output').removeClass('alert-danger')
                        .removeClass('alert-success')
                        .addClass('alert alert-danger animated fadeInUp');
            return false;
        } else {
            /*Comentado pois caso o cliente tenha cadastrado com o cpf/cnpj errado não iria conseguir recuperar a senha
            var cpf_number = onlynumbers(cpf);

            if (isNumeric(cpf_number)) {

                cpf = cpf_number;

                if(!valida_cpf_cnpj(cpf)){                    
                        $('#output').html("CPF/CNPJ inválido!");
                        $('#output').removeClass('alert-danger')
                                    .removeClass('alert-success')
                                    .addClass('alert alert-danger animated fadeInUp');
                        return false;                    
                }
            }*/

            var ONE_HOUR = 60 * 60 * 1000;
            var dtUltRecupSenha = getLocalStorage("dtUltRecupSenha");
            var qtdRecupSenha = getLocalStorage("qtdRecupSenha");

            if (dtUltRecupSenha === "") {
                dtUltRecupSenha = new Date();
            } else {
                dtUltRecupSenha = new Date(dtUltRecupSenha);

                if (((new Date()) - dtUltRecupSenha) > ONE_HOUR) {
                    dtUltRecupSenha = new Date();
                    qtdRecupSenha = 0;
                }
            }

            setLocalStorage("dtUltRecupSenha", dtUltRecupSenha);

            if (qtdRecupSenha === "") {
                qtdRecupSenha = 1;
            } else {
                qtdRecupSenha++;
            }

            setLocalStorage("qtdRecupSenha", qtdRecupSenha);

            if ((((new Date()) - dtUltRecupSenha) < ONE_HOUR) && qtdRecupSenha > 3) {
                $('#output').html("Tente novamente em 1 hora");
                $('#output').removeClass('alert-danger')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger animated fadeInUp');

                setTimeout(function () {
                    $.cxDialog({
                        title: 'ATENÇÃO',
                        info: 'Já houveram 3 tentativas de recuperação de senha, tente novamente em 1 hora',
                        ok: function () {}
                    });
                }, 1000);
                return false;
            }

            $.ajax({
                url: "/usuario/change_password",
                type: "POST",
                data: {'cpf': cpf, 'origem': origem},
                beforeSend: function () {
                    toggleLoading(true);
                },
                success: function (retorno) {

                    retorno = retorno.trim().toLowerCase();

                    switch (retorno.substring(0, 4)) {
                        case "erro":
                            $('#output').html("CPF/CNPJ ou login não localizado");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');

                            setLocalStorage("recaptcha", "S");
                            break;
                        case "inat":
                            $('#output').html("Conta inativada pelo gestor");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');

                            break;
                        case "nega":
                            $('#output').html("Sem permissão de acesso");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');

                            break;
                        case "aten":
                            $('#output').html("Sem canal de recuperação no seu cadastro");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');

                            setTimeout(function () {
                                $.cxDialog({
                                    title: 'ATENÇÃO',
                                    info: 'Nenhum canal de recuperação de senha foi definido pelo gestor dos seus dados. (EMAIL, SMS ou WHATSAPP) <br/> Sua senha NÃO será redefinida!',
                                    ok: function () {}
                                });
                            }, 1000);

                            break;
                        default:
                            $('#output').html("Uma nova senha será enviada em breve");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-success animated fadeInUp');
                            $("#trocaSenhaId").addClass("hide");
                            $("#loginId").removeClass("hide");
                            $('#cpf').val("");

                            setTimeout(function () {
                                $.cxDialog({
                                    title: 'SUCESSO',
                                    info: retorno,
                                    ok: function () {}
                                });
                            }, 1000);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    toggleLoading(false);
                    $.cxDialog({
                        title: 'ERRO',
                        info: 'Nào foi possível recuperar a sua senha',
                        ok: function () {}
                    });
                },
                complete: function () {
                    toggleLoading(false);
                }
            });
        }
    }
}

function onSubmit(token, callback = false) {

    if ((getLocalStorage("recaptcha") === "N" || localhost) ||
            (getLocalStorage("recaptcha") === "S"
                    && typeof grecaptcha != 'undefined'
                    && grecaptcha
                    && grecaptcha.getResponse(0) !== ""
                    && token !== ""
                    && token === grecaptcha.getResponse(0))) {

        //console.log("onSubmit OK");
        var dados = $('#ajax_form :not(input[name=auth_pw])').serialize();

        if ($('#share-code').val()) {
            dados += '&share-code=' + $('#share-code').val();
        } else {
            if ($('#auth_user').val().trim() === "") {
                $('#output').html("Usuário não informado!");
                $('#output').removeClass('alert-danger')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger animated fadeInUp');

                toggleLoading(false);
                return false;
            }

            if ($('#auth_pw').val().trim() === "") {
                $('#output').html("Senha não informada");
                $('#output').removeClass('alert-danger')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger animated fadeInUp');

                toggleLoading(false);
                return false;
            }

            if (callback || (empresa && empresa !== "rdv")) {
                dados += '&empresa=' + empresa;
            }

            if (plataforma) {
                dados += '&plataforma=' + plataforma;
            }

            if (playerId) {
                dados += '&playerId=' + playerId;
            }

            if (pushToken) {
                dados += '&pushToken=' + pushToken;
            }

            if (empresaEscolhida) {
                dados += '&empresa_escolhida=' + empresaEscolhida;
            }

            if (empresaMatriz) {
                dados += '&empresa_matriz=' + empresaMatriz;
            }

            if($('#get_ip').val().trim()){
                dados += "&cliente_ip=" + $('#get_ip').val().trim();
            }
        }

        dados += "&pass=" + string2Hex(posicionaCSS($("#auth_pw").val().trim()));
        
        submit(dados);
    } else {
        $.cxDialog({
            title: 'ATENÇÃO',
            info: 'Login não permitido!',
            ok: function () {
                toggleLoading(false);
            }
        });
    }

    //Limpa o recaptcha de login
    if (getLocalStorage("recaptcha") === "S"
            && typeof grecaptcha != 'undefined'
            && grecaptcha) {
        //console.log("limpou o recaptcha");
        grecaptcha.reset(0);
    }
}

function submit(dados) {
    $.ajax({
        url: "/usuario/account_login",
        type: "POST",
        data: dados,
        beforeSend: function () {
            toggleLoading(true);
        },
        success: function (retorno) {
            if (retorno) {
                if (retorno.trocasenha) { //Troca de senha obrigatória
                    var id_user = retorno.trocasenha;

                    $('#troca_senha_user').val(id_user);
                    $('#output').html("Você precisa atualizar sua senha");
                    $('#output').removeClass('alert-danger')
                                .removeClass('alert-success')
                                .addClass('alert alert-danger animated fadeInUp');
                    $("#loginId").addClass("hide");
                    $("#trocaSenhaUser").removeClass("hide");
                    sanitize();
                } else if (retorno.indexOf("em-manutencao") !== -1) { //Sistema em manutenção
                    $('#output').html("Em manutenção, aguarde alguns minutos");
                    $('#output').removeClass('alert-danger')
                                .removeClass('alert-success')
                                .addClass('alert alert-danger animated fadeInUp');
                    sanitize();
                } else { //Retorno de account_login
                    retorno = retorno.trim().toLowerCase();

                    switch (retorno) {
                        case "erro":
                            $('#output').html("Usuário e/ou senha incorretos");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            setLocalStorage("recaptcha", "S");
                            break;
                        case "desativado":
                            $('#output').html("Conta inativada pelo gestor");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        case "sem-acesso-web":
                            $('#output').html("Sem permissão de acesso WEB e APP");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        case "nao-permitido":
                            $('#output').html("Acesso não permitido");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        case "bloqueado":
                            $('#output').html("Conta bloqueada");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
    
                            setTimeout(function () {
                                $.cxDialog({
                                    title: 'CONTA BLOQUEADA',
                                    info: '<br>Procure a empresa responsável pelo seu login para maiores informações sobre este bloqueio',
                                    ok: function () {}
                                });
                            }, 1000);
                            break;
                        case "code-expired":
                            $('#output').html("Link expirado");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        case "nenhum":
                            $('#output').html("Nenhum ativo cadastrado ou liberado");
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            setLocalStorage("recaptcha", "S");
                            break;
                        case "fora-do-horario":
                            $('#output').html('Horário de acesso não permitido');
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        case "data-expirada":
                            $('#output').html('Usuário com data expirada');
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        case "ip-invalido":
                            $('#output').html('Dispositivo não autorizado');
                            $('#output').removeClass('alert-danger')
                                        .removeClass('alert-success')
                                        .addClass('alert alert-danger animated fadeInUp');
                            sanitize();
                            break;
                        default:
                            let retornoArray = retorno.split('&');
    
                            if (retornoArray.length > 2) {
    
                                switch (retornoArray[0]) {
                                    case "empresas": //mais de uma empresa
                                        break;
                                    case "filiais": //possui filiais
                                        empresaMatriz = retornoArray[1].toUpperCase();
                                        break;
                                }
    
                                let comboEmpresas = ` <select class='form-control' id='prompt_empresa'>
                                                        <option value='' disabled selected>Selecione...</option>`;
    
                                for (i = 1; i < retornoArray.length; i++) {
                                    comboEmpresas += "<option value='" + retornoArray[i].toLowerCase() + "'>" + retornoArray[i] + "</option>";
                                }
    
                                comboEmpresas += '</select>';
    
                                $.cxDialog({
                                    title: '<span>Selecione uma empresa</span>',
                                    info: '<div style="margin-top: 10px;">' +
                                            comboEmpresas +
                                            '</div>',
                                    ok: function () {
                                        toggleLoading(false);
                                        setLocalStorage("recaptcha", "N");
    
                                        empresa = $('#prompt_empresa').val();
    
                                        if (empresa) {
                                            empresaEscolhida = empresa.toUpperCase();
                                            setSessionStorage("empresa", empresa);
                                            removeLocalStorage("empresa");
    
                                            setTimeout(function () {
                                                onSubmit("", true);
                                            }, 1000);
                                        } else {
                                            setTimeout(function () {
                                                $.cxDialog({
                                                    title: 'ATENÇÃO',
                                                    info: 'Nenhuma empresa foi selecionada',
                                                    ok: function () {}
                                                });
                                            }, 1000);
                                        }
                                    },
                                    okText: 'Entrar',
                                    no: function () {
                                        reload();
                                    },
                                    noText: 'Cancelar'
                                });
                            } else {                            
                                    //CONTAGEM PRA MOSTRAR POPUP DE AVALIAÇÃO DO APP PARA ANDROID E IPHONE
                                if(isMobile() && empresa == "rdv"){
                                    if(!localStorage.getItem("contagemAvaliacao")){
                                        localStorage.setItem("contagemAvaliacao", '0');
                                    }
                                    
                                    let addAvaliacao = parseInt(localStorage.getItem("contagemAvaliacao"));
                                    if (addAvaliacao <= 5){
                                        localStorage.setItem("contagemAvaliacao", ++addAvaliacao);
                                    }
                                }
                                //=====================================================================
    
                                $('#output').html("Login realizado com sucesso");
                                $('#output').removeClass('alert-danger')
                                            .removeClass('alert-success')
                                            .addClass('alert alert-success animated fadeInUp');
    
                                if ($("#lembrarDeMimId").is(':checked')) {
                                    setLocalStorage("remember", "S");
    
                                    if (isAndroidOrIphone()) {
                                        setLocalStorage("logado", "S");
                                    } else {
                                        setLocalStorage("logado", "N");
                                    }
    
                                    setLocalStorage("user", $('#auth_user').val());
                                    setLocalStorage("_ixw_sp_wq", posicionaCSS($('#auth_pw').val()));
                                    removeLocalStorage("pass"); // remover esta linha em agosto 2022 ou posterior
                                } else {
                                    removeLocalStorage("remember");
                                    removeLocalStorage("user");
                                    removeLocalStorage("pass"); // remover esta linha em agosto 2022 ou posterior
                                    removeLocalStorage("_ixw_sp_wq");
                                    removeLocalStorage("logado");
                                }
                                setLocalStorage("recaptcha", "N");
                                removeSessionStorage("boasVindasSistema");
                                removeSessionStorage("paginaInicial");
                            // if(retornoArray[1]){
                                    setSessionStorage("empresa", retornoArray[1].toLowerCase());
                            // }
                                switch (retornoArray[0].slice(-1)) {
                                    case "1": //uma empresa somente
                                        retorno += "&unico";
                                        setLocalStorage("empresa", retornoArray[1].toLowerCase());
                                        break;
                                    case "2": //mais de uma empresa
                                        retorno += "&muitos";
                                        setLocalStorage("empresa", getCookie("empresa_original") ? getCookie("empresa_original") : getLocalStorage("empresa_original"));
                                        break;
                                    case "3": //master login
                                        retorno += "&master";
                                        setLocalStorage("empresa", getCookie("empresa_original") ? getCookie("empresa_original") : getLocalStorage("empresa_original"));
                                        break;
                                    case "4": //empresa central
                                        retorno += "&central";
                                        setLocalStorage("empresa", getCookie("empresa_original") ? getCookie("empresa_original") : getLocalStorage("empresa_original"));
                                        break;
                                    case "5": //selecionou uma empresa
                                        retorno += "&selecionado";
                                        setLocalStorage("empresa", getCookie("empresa_original") ? getCookie("empresa_original") : getLocalStorage("empresa_original"));
                                        break;
                                    case "6": //grupo
                                        retorno += "&grupo";
                                        setLocalStorage("empresa", retornoArray[1].toLowerCase());
                                        break;
                                }
    
                                $('#entrarId').prop('disabled', true);
                                location.href = retorno;
                            }
    
                            break;
                    }
                }
            } else {
                //Sem retorno
                sanitize();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

            if (navigator.onLine) {
                $('#output').html("Erro ao efetuar login!");
            } else {
                $('#output').html("Sem conexão de internet!");
            }

            $('#output').removeClass('alert-danger')
                        .removeClass('alert-success')
                        .addClass('alert alert-danger animated fadeInUp');

            toggleLoading(false);
        },
        complete: function () {
            toggleLoading(false);
        }
    });
}

function limparCache() {
    $('.login-plataforma').addClass('hide');

    setTimeout(function () {
        clearCache++;

        if (clearCache === 3) {
            clearCache = 0;
            clearCookies();
            clearLocalStorage();
            clearSessionStorage();

            let newUrl = location.origin + location.pathname;

            switch (plataforma) {
                case "android":
                case "ios":
                    empresa = getCookie("empresa_original") ? getCookie("empresa_original") : getLocalStorage("empresa_original") ? getLocalStorage('empresa') : "rdv";

                    newUrl += '?empresa=' + empresa;
                    newUrl += '&plataforma=' + plataforma;

                    if (playerId) {
                        newUrl += '&playerId=' + playerId;
                    }

                    if (pushToken) {
                        newUrl += '&pushToken=' + pushToken;
                    }

                    break;
                case "web":
                    if (window.self !== window.top) {
                        newUrl += '?empresa=' + getURLParameter('empresa');
                        setLocalStorage("empresa_original", getURLParameter('empresa'));
                    } else {
                        newUrl += '?empresa=rdv';
                        setLocalStorage("empresa_original", "rdv");
                    }

                    newUrl += '&plataforma=web';
                    break;
            }

            location.href = newUrl;
        }

        $('.login-plataforma').removeClass('hide');
    }, 1000);
}

function sanitize() {
    empresa = getCookie("empresa_original") ? getCookie("empresa_original") : getLocalStorage("empresa_original");
    empresaEscolhida = "";
    empresaMatriz = "";
    toggleLoading(false);
}

function reload() {
    document.location.reload(true);
}

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false);
}

function isAndroidOrIphone() {    
    return (/Android|iPhone/i.test(navigator.userAgent) ? true : false);}

$(document).ready(function () {

    $.ajax({
        dataType: "json",
        url: "/version",
        complete: function(data) {
            if (data && data.responseJSON) {
                if (data.responseJSON.environment === "prod") {
                    $('#version').html(data.responseJSON.show);
                } else {
                    pathArray = location.host.split('.');
                    var subdomain = pathArray[0];
                    $('#version').html(subdomain + '::v' + data.responseJSON.version);
                    $('h1').text(subdomain);
                    $('h1').css('color', 'red');
                }
            }
        }
    });

    if (!getLocalStorage("cor_barra")) {
        setLocalStorage("cor_barra", "rgb(34, 34, 34)");
    }

    $(".card_login, .bar_color_origem").css("background-color", getLocalStorage("cor_barra"));

    //if (!checkCookie()) {
    //    $('#entrarId').attr("disabled", true);
    //    window.alert("Este site não funciona com os cookies desabilitados!");
    //} else {
        $.get("/logout", function () {}, "html");

        clearSessionStorage();

        $('#logo-id').on("error", function () {
            $(this).attr('src', cdn + '/empresas/logos/rdv_login.png');
        });

        if (getLocalStorage("recaptcha") === "") {
            setLocalStorage("recaptcha", "N");
        }

        plataforma = getURLParameter('plataforma');
        playerId = getURLParameter('playerId');
        pushToken = getURLParameter('pushToken');
        share = getURLParameter('share-code');
        redirect = getURLParameter('redirect');
        mensagem = getURLParameter('mensagem');

        if (mensagem) {
            $('#output').removeClass('alert-danger')
                        .removeClass('alert-success');

            switch (mensagem) {
                case "acesso-indevido":
                    $('#output').html("Tentativa de acesso indevido");
                    $('#output').addClass('alert alert-danger animated fadeInUp');
                    break;
                case "sessao-expirada":
                    $('#output').html("Sua sessão expirou");
                    $('#output').addClass('alert alert-danger animated fadeInUp');
                    break;
            }
        }

        if (playerId) {
            setLocalStorage('playerId', playerId);
        } else {
            playerId = getLocalStorage('playerId');
        }

        if (pushToken) {
            setLocalStorage('pushToken', pushToken);
        } else {
            pushToken = getLocalStorage('pushToken');
        }

        if (plataforma) {
            setLocalStorage('plataforma', plataforma);
        } else {
            plataforma = getLocalStorage('plataforma');
        }

        switch (plataforma) {
            case "android":
                $('#plataforma-id').attr('src', cdn + '/android_32.png');
                break;
            case "ios":
                // remove cookieconsent for iOS devices
                //var ele = document.querySelectorAll('[aria-label="cookieconsent"]');
                //if (ele && ele[0]) {
                //    ele[0].remove();
                //}

                $('#plataforma-id').attr('src', cdn + '/ios_32.png');
                break;
            default:
                plataforma = "web";
                playerId = "";
                pushToken = "";
                removeLocalStorage('playerId');
                removeLocalStorage('pushToken');
                $('#plataforma-id').attr('src', cdn + '/web_32.png');
        }

        if ((redirect && redirect === "yes") || (window.self !== window.top)) {
            empresa = getURLParameter('empresa') ? getURLParameter('empresa') : getLocalStorage('empresa') ? getLocalStorage('empresa') : "rdv";
            setLocalStorage("empresa_original", empresa);
            setLocalStorage('empresa', empresa);
        } else {
            empresa = getLocalStorage('empresa') ? getLocalStorage('empresa') : getURLParameter('empresa') ? getLocalStorage('empresa') : "rdv";
        }

        if (empresa && getURLParameter('empresa')
                && getLocalStorage('empresa')
                && getURLParameter('empresa') === getLocalStorage('empresa')
                && getURLParameter('plataforma')
                && getLocalStorage('plataforma')
                && getURLParameter('plataforma') === getLocalStorage('plataforma')) {

            switch (plataforma) {
                case "android":
                case "ios":
                    if (getURLParameter('playerId') !== getLocalStorage('playerId')) {
                        let newUrl = location.origin + location.pathname;
                        newUrl += "?empresa=" + empresa;
                        newUrl += "&plataforma=" + plataforma;

                        if (playerId) {
                            newUrl += "&playerId=" + playerId;
                        }

                        if (pushToken) {
                            newUrl += "&pushToken=" + pushToken;
                        }

                        if (mensagem) {
                            newUrl += "&mensagem=" + mensagem;
                        }

                        location.href = newUrl;
                    }
                    break;
            }
            
                $('#logo-mobile').attr("src", cdn + '/empresas/logos/' + empresa + '_menu.png');
                $('#logo-id').attr('src', cdn + '/empresas/logos/' + empresa + '_login.png');   
        } else {
            empresa = getLocalStorage("empresa");

            if (empresa === "") {
                empresa = getURLParameter('empresa');
            }

            empresa = empresa ? empresa : "rdv";
            setLocalStorage("empresa", empresa);

            let newUrl;

            if (share) {
                empresa = getURLParameter('empresa') ? getURLParameter('empresa') : "rdv";
                setLocalStorage("empresa", empresa);
                newUrl = location.origin + location.pathname + "?empresa=" + empresa;
            } else {
                newUrl = location.origin + location.pathname + "?empresa=" + empresa;
            }

            if (share) {
                newUrl += '&plataforma=web';

                if (share) {
                    newUrl += '&share-code=' + share;
                }
            } else {
                if (plataforma) {
                    newUrl += '&plataforma=' + plataforma;
                }

                if (playerId) {
                    newUrl += '&playerId=' + playerId;
                }

                if (pushToken) {
                    newUrl += '&pushToken=' + pushToken;
                }
            }

            if (mensagem) {
                newUrl += "&mensagem=" + mensagem;
            }

            location.href = newUrl;
        }

        if (getCookie("empresa_original") === "" || getLocalStorage("empresa_original") === "") {
            setLocalStorage("empresa_original", empresa);
        }


        if (getURLParameter('logout') === 'code-expired') {
            $('#output').html("Link expirado!");
            $('#output').removeClass('alert-danger')
                        .removeClass('alert-success')
                        .addClass('alert alert-danger animated fadeInUp');
        }

        $('#entrarId').on('click', function (e) {
            e.preventDefault();

            if (!localhost && getLocalStorage("recaptcha") === "S" && typeof grecaptcha !== 'undefined' && grecaptcha && $('#share-code').val() === "") {
                try {
                    if (grecaptcha.execute(0)) {
                        //console.log("executou o reCaptcha");
                        setTimeout(function () {
                            try {
                                if (grecaptcha.getResponse(0)) {
                                    //console.log("reCaptcha: " + grecaptcha.getResponse(0));
                                    onSubmit(grecaptcha.getResponse(0), false);
                                }
                            } catch (err) {
                                setLocalStorage("recaptcha", "N");
                                onSubmit("", false);
                            }
                        }, 1000);
                    }
                } catch (err) {
                    setLocalStorage("recaptcha", "N");
                    onSubmit("", false);
                }
            } else {
                onSubmit("", false);
            }
        });

        $('#closeId').on('click', function (e) {
            e.preventDefault();
            $("#trocaSenhaId").addClass("hide");
            $("#loginId").removeClass("hide");
        });

        $('#auth_user').keypress(function (e) {
            if (e.which === 13) {  // the enter key code
                $("#entrarId").click();
            }
        });

        $('#auth_pw').keypress(function (e) {
            if (e.which === 13) {  // the enter key code
                $("#entrarId").click();
            }
        });

        $('.forgot-pass').click(function (e) {
            e.preventDefault();
            $("#trocaSenhaId").removeClass("hide");
            $("#loginId").addClass("hide");
            setFocusToCpf();
        });

        remember();
        toggleLoading(false);

        setTimeout(function () {
            $('[data-toggle="tooltip"]').tooltip().mouseover();
            setTimeout(function () {
                $('[data-toggle="tooltip"]').tooltip('hide');
            }, 3000);
        }, 5000);

        $('#btn_troca_senha_user').click(function () {

            var trocasenha_atual = $('#senha_atual').val();
            var trocasenha_nova = $('#nova_senha').val();
            var trocasenha_repita = $('#repita_senha').val();

            if (trocasenha_nova != trocasenha_repita) {
                $('#output').html("Senha nova diferente da confirmação");
                $('#output').removeClass('alert-danger')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger animated fadeInUp');

                return false;
            }

            if (trocasenha_atual == trocasenha_nova) {
                $('#output').html("Senha atual não pode ser igual a nova");
                $('#output').removeClass('alert-danger')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger animated fadeInUp');

                return false;
            }

            if (trocasenha_nova.length < 4) {
                $('#output').html("Senha nova com menos de 4 dígitos");
                $('#output').removeClass('alert-danger')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger animated fadeInUp');

                return false;
            }

            user = {
                senhaAtual: $('#senha_atual').val(),
                novaSenha: $('#nova_senha').val(),                
                confirmacaoSenha: $('#repita_senha').val() 
            }

            $.post("/conta/ContaController", JSON.stringify(user), function (res) {
               
                switch (res.status) {
                    case 200:
                        $('#output').html(res.message);
                        $('#output').removeClass('alert-danger')
                                    .removeClass('alert-success')
                                    .addClass('alert alert-success animated fadeInUp');
    
                        let dados = `auth_user=${$('#auth_user').val()}&plataforma=${plataforma}`;
                        dados += `&pass=${string2Hex(posicionaCSS($("#nova_senha").val().trim()))}`;

                        if ($("#lembrarDeMimId").is(':checked')) {

                            setLocalStorage("remember", "S");

                            if (isAndroidOrIphone()) {
                                setLocalStorage("logado", "S");
                            } else {
                                setLocalStorage("logado", "N");
                            }

                            $('#auth_pw').val($("#nova_senha").val().trim());
                            setLocalStorage("user", $('#auth_user').val());
                            setLocalStorage("_ixw_sp_wq", posicionaCSS($('#nova_senha').val().trim()));
                        }

                        submit(dados); 
                        break;
                    
                    case 400:
                        $('#output').html(res.message);
                        $('#output').removeClass('alert-danger')
                                    .removeClass('alert-success')
                                    .addClass('alert alert-danger animated fadeInUp');
                    break;                  
                
                    // default:
                    //     break;
                }
            });
        });

        if (getURLParameter('share-code')) {
            setLocalStorage("recaptcha", "N");
            $('#share-code').val(getURLParameter('share-code'));
            $("#entrarId").click();
        }
    //}

    var xml = new XMLHttpRequest();
    xml.open("GET", "https://api.ipify.org");
    xml.send();
    xml.addEventListener("loadend", loaded);

    function loaded(e) {
        return WriteDb(xml.responseText);
    }

    function WriteDb(ip) {
        $('#get_ip').val(ip);
    }

    

var images = ["/assets/img/tela_login.jpg", "/assets/img/tela_login3.jpg"];
var index=0;

function changeImage(){
    
    $(".right").fadeTo(3000,0.30, function() {
        $(".right").css("background-image", "url(" + images[index] + ")");
        index++;
        if(index >= images.length){
            index=0;
        }
    }).fadeTo(1000,1);
    return false;
}

setInterval(changeImage, 10000);
    
});
