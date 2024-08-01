<!-- src/App.vue -->
<template>
  <div id="app">
    <UserProfile />
  </div>
</template>

<script>
import UserProfile from './components/UserProfile.vue';

export default {
  name: 'App',
  components: {
    UserProfile,
  },
};
</script>
