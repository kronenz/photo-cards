<script>
  import { enhance } from '$app/forms';
</script>

<h1>Sign Up</h1>

<form method="POST" use:enhance>
  <label>
    Username
    <input name="username" type="text" required />
  </label>
  <label>
    Password
    <input name="password" type="password" required />
  </label>
  <button>Sign up</button>
</form>