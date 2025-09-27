<script>
  import { enhance } from '$app/forms';
</script>

<h1>Upload Image</h1>

<form action="?/upload" method="POST" enctype="multipart/form-data" use:enhance>
  <label>
    Image
    <input name="image" type="file" required />
  </label>
  <button>Upload</button>
</form>