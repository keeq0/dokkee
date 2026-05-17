<template>
    <header class="header">
        <div class="header__left">
            <div 
                class="header__burger" 
                :class="{ active: isMenuOpen }"
                @click="toggleMenu"
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
            <TheLogo />
        </div>
        <div class="header__nav" :class="{ active: isMenuOpen }">
            <TheNavigation @close-menu="closeMenu" />
        </div>
        <UserActions />
    </header>
</template>
<script>
import TheLogo from './TheLogo.vue';
import TheNavigation from './TheNavigation.vue';
import UserActions from './UserActions.vue';

export default {
    components: {
        TheLogo,
        TheNavigation,
        UserActions
    },
    data() {
        return {
            isMenuOpen: false
        }
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            if (this.isMenuOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        },
        closeMenu() {
            this.isMenuOpen = false;
            document.body.style.overflow = '';
        }
    }
}
</script>
<style scoped>

.header {
    margin: 20px auto;
    width: 1200px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
}

.header__left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header__burger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 24px;
    cursor: pointer;
    z-index: 1001;
}

.header__burger span {
    width: 100%;
    height: 3px;
    background-color: #6C67FD;
    border-radius: 15px;
    transition: all 0.3s ease;
}

.header__burger.active span:nth-child(1) {
    transform: rotate(45deg) translate(8px, 8px);
}

.header__burger.active span:nth-child(2) {
    opacity: 0;
}

.header__burger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(8px, -8px);
}

@media (max-width: 1200px) {
    .header {
        width: 90%;
    }
}

@media (max-width: 992px) {
    .header__burger {
        display: flex;
    }
    
    .header__nav {
        position: fixed;
        top: 0;
        left: -100%;
        width: 80%;
        max-width: 350px;
        height: 100vh;
        background: white;
        z-index: 1000;
        transition: left 0.3s ease;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        padding-top: 80px;
    }
    
    .header__nav.active {
        left: 0;
    }
}

@media (max-width: 768px) {
    .header {
        height: 40px;
    }
}

@media (max-width: 480px) {
    .header__nav {
        width: 100%;
        max-width: none;
    }
}
</style>