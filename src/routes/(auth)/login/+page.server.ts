import { loginSchema } from "$lib/zod-schemas";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db";
import { accounts, users } from "$lib/server/schemas";
import { eq } from "drizzle-orm";
// import { Argon2id } from "oslo/password";
import { lucia } from "$lib/server/auth";

export const load = async (event) => {
	if (event.locals.user) redirect(302, "/");
	return {
		form: await superValidate(zod(loginSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.user) redirect(302, "/");
		const form = await superValidate(event, zod(loginSchema));

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		const existingUser = db
			.select()
			.from(users)
			.where(eq(users.username, form.data.username))
			.get();

		if (!existingUser) {
			return setError(form, "", "Invalid username or password.");
		}

		const account = db.select().from(accounts).where(eq(accounts.id, existingUser.id)).get();

		if (!account) {
			return setError(form, "", "An error occurred while logging in. Please try again.");
		}

		const validPassword = await Bun.password.verify(form.data.password, account.hashedPassword);

		if (!validPassword) {
			return setError(form, "", "Invalid username or password.");
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes,
		});

		redirect(302, "/");
	},
};
