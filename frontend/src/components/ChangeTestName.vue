<script setup>
    import {ref} from 'vue'
    
</script>
<template>
    <div class="modal" id="change-name-modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Change Project Name</h3>
            <p class="py-4">This is a placeholder for the change project name functionality.</p>
            <div class="modal-action">
                <button class="btn btn-primary" @click="$emit('close')">Close</button>
            </div>
        </div>
    </div>
</template>