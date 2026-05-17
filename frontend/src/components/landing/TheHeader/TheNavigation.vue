<template>
    <nav class="navigation">
        <li class="navigation__item">
            <a class="navigation__link" href="#service" @click="handleClick">Сервис</a>
        </li>
        <li class="navigation__item">
            <a class="navigation__link" href="#service" @click="handleClick">Подписки</a>
        </li>
        <li class="navigation__item">
            <a class="navigation__link" href="#service" @click="handleClick">Команда</a>
        </li>
        <li class="navigation__item">
            <a class="navigation__link" href="#service" @click="handleClick">Контакты</a>
        </li>
    </nav>
</template>
<script>
export default {
    methods: {
        handleClick() {
            this.$emit('close-menu');
        }
    }
}
</script>
<style scoped>
    .navigation {
        width: 520px;
        height: 45px;
        border: 1px solid #e6e6e6;
        border-radius: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        position: relative;
        overflow: visible;
        list-style: none;
        backdrop-filter: blur(2px);
    }

    .navigation__link {
        font-size: 16px;
        font-weight: 500;
        color: #000;
        transition: color .2s;
        position: relative;
        display: inline-block;
        text-decoration: none;
        cursor: pointer;
    }

    .navigation__link::after {
        content: '';
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: #6C67FD;
        border-radius: 50px;
        transition: width .2s ease;
    }

    .navigation__link:hover {
        color: #6C67FD;
    }

    .navigation__link:hover::after {
        width: 100%;
    }

@media (max-width: 992px) {
    .navigation {
        width: 100%;
        height: auto;
        border: none;
        border-radius: 0;
        flex-direction: column;
        padding: 0;
        gap: 20px;
        background: transparent;
    }
    
    .navigation__item {
        width: 100%;
        text-align: center;
    }
    
    .navigation__link {
        font-size: 20px;
        padding: 10px 0;
        display: block;
    }
    
    .navigation__link::after {
        display: none;
    }
    
    .navigation__link:hover {
        color: #6C67FD;
        background: #f5f5f5;
    }
}

@media (max-width: 768px) {
    .navigation__link {
        font-size: 18px;
        padding: 8px 0;
    }

    .navigation__item {
        width: fit-content;
        border: 1px solid #e6e6e6;
        border-radius: 50px;
        padding: 0 30px;
    }
}

@media (max-width: 480px) {
    .navigation__link {
        font-size: 16px;
        padding: 6px 0;
    }
}
</style>