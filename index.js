import Fastify from "fastify";
import fastifyPassport from "@fastify/passport";
import secureSession from "@fastify/secure-session";
import GoogleStrategy from "passport-google-oauth20";
import { googleClientID, googleClientSecret } from "./config/keys.js";

const app = Fastify({
	logger: true,
});

fastifyPassport.use(
	"google",
	new GoogleStrategy.Strategy(
		{
			clientID: googleClientID,
			clientSecret: googleClientSecret,
			callbackURL: "http://localhost:5000/auth/google/callback",
		},
		(accessToken, refreshToken, profile, done) => {
			done(null, {
				id: profile.id,
				displayName: profile.displayName,
				emails: profile.emails,
			});
		},
	),
);

const sessionKey = process.env.SESSION_KEY;

await app.register(secureSession, {
  key: Buffer.from(sessionKey, "hex"),
  cookie: {
    path: "/",
    httpOnly: true,
    secure: false, // localhost sem HTTPS
    sameSite: "lax",
  },
});

await app.register(fastifyPassport.initialize());
await app.register(fastifyPassport.secureSession());


app.get(
	"/auth/google",
	{
		preValidation: fastifyPassport.authenticate("google", {
			scope: ["profile", "email"],
			session: false,
		}),
	},
	async () => {},
);

app.get(
	"/auth/google/callback",
	{
		preValidation: fastifyPassport.authenticate("google"),
	},
	async (request) => {
		return {
			user: request.user,
		};
	},
);

app.get("/auth/google/failure", async (_, reply) => {
	return reply.code(401).send({
		message: "Falha na autenticação com o Google",
	});
});

const port = Number(process.env.PORT ?? 5000);

try {
	await app.listen({ port });
} catch (error) {
	app.log.error(error);
	process.exit(1);
}
