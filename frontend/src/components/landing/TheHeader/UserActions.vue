<template>
    <div class="user-actions">
        <p class="user-actions__language">RU</p>
        <button class="user-actions__button">Войти</button>
    </div>
</template>
<script>
export default {
    
}
</script>
<style scoped>
    
    .user-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
    }

    .user-actions__language {
        font-size: 16px;
        color: #A2A2A2;
        transition: color .2s;
    }

    .user-actions__language:hover {
        color: #000;
        cursor: pointer;
    }

    .user-actions__button {
        width: 150px;
        height: 40px;
        font-size: 16px;
        font-weight: 600;
        color: #FFF;
        background-color: #6C67FD;
        transition: background-color .2s;
        border-radius: 15px;
        border: none;
        outline: none;
    }

    .user-actions__button:hover {
        background-color: #4d48d8;
        cursor: pointer;
    }
    
@media (max-width: 768px) {
    .user-actions {
        gap: 12px;
    }
    
    .user-actions__language {
        font-size: 14px;
    }
    
    .user-actions__button {
        width: 100px;
        height: 35px;
        font-size: 14px;
        border-radius: 12px;
    }
}

@media (max-width: 480px) {
    .user-actions {
        gap: 10px;
    }
    
    .user-actions__language {
        font-size: 13px;
    }
    
    .user-actions__button {
        width: 80px;
        height: 32px;
        font-size: 13px;
        border-radius: 10px;
    }
}
</style>