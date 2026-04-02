<script setup lang="ts">
import PythonLogicPanel from '@/components/PythonLogicPanel.vue'
import TaskBoard from '@/components/TaskBoard.vue'
import Welcome from './Welcome.vue';
</script>

<template>
	<main class="page">
		<!-- <Welcome /> -->
		<!-- <PythonLogicPanel /> -->
		<TaskBoard />
	</main>
</template>

<style scoped>
.page {
	padding: 1rem;
	display: grid;
	gap: 1rem;
	max-width: 760px;
	margin: 0 auto;
}

@media (max-width: 640px) {
	.page {
		padding: 0.75rem;
	}
}
</style>
