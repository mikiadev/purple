<script lang="ts">
	import type { Comment, User } from "$lib/server/schemas";

	type Props = {
		comment: Comment & {
			user: User;
		};
	};

	let { comment } = $props<Props>();
</script>

<div class="flex items-center">
	{comment.content}
</div>
