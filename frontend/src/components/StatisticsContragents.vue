<template>
    <div class="statistics__contragents">
        <div class="contragents__top">
            <div class="header">
                <p class="header__top">ИЗУЧЕННЫЕ</p>
                <p class="header__bottom">КОНТРАГЕНТЫ</p>
            </div>
        </div>
        <div class="contragents__bottom">
            <p class="contragents__number">70</p>
        </div>
    </div>
</template>

<script>
export default {
  name: 'StatisticsContragents'
}
</script>

<style scoped>
.statistics__contragents {
    width: 150px;
    height: 110px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
}

.statistics__contragents:hover .contragents__bottom {
    background-color: rgba(108,103,253,0.5);
}

.statistics__contragents:hover .header__top {
    transform: translateX(10px);
}

.header__top {
    font-size: 10px;
    font-weight: bold;
    color: #6C67FD;
    transition: 0.2s;
}

.header__bottom {
    font-size: 16px;
    font-weight: bold;
    color: #6C67FD;
    transition: 0.2s;
}

.contragents__bottom {
    width: 100%;
    height: 75px;
    background-color: #6C67FD;
    border-radius: 0 0 20px 20px;
    padding-bottom: 15px;
    padding-right: 30px;
    text-align: end;
    transition: 0.2s;
    overflow: visible; /* чтобы анимация не обрезалась */
}

.contragents__number {
    font-size: 50px;
    font-weight: 900;
    color: #FFF;
    text-shadow: 0 2px 3px rgba(0,0,0,0.5);
    margin: 0;
    /* запускаем «эпичную» анимацию при монтировании */
    animation: epic-appear 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes epic-appear {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-30deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) rotate(10deg);
  }
  80% {
    transform: scale(0.9) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
