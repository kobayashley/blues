# Blues
A companion to the Discord [Rythm](https://rythm.fm/) Bot

## About
Blues was created by [Ashley Kobayashi](https://github.com/kobayashley) and [Braxton Hall](https://github.com/braxtonhall).

## Commands
In all examples below, the prefix has been set to `$`

### `$help <commandName>?`
Displays the list of commands.
Optionally adding a command name
will make Blues respond with details about the named command.

Example:
```
$help playlist
```

### `$mute <setting> <channel>?`
```
<setting> ::= on | off | warn
```
Toggles automatic muting when in voice with Rythm.
When set to `warn`, Blues will mention a user with their microphone
turned on instead.

If a channel is provided, warnings will go to the specified channel.
Otherwise, warnings will be sent to the channel where the setting
was enabled.

Example:
```
$mute warn #bot-spam
```

### `$playlist <source>? (<year> <month> <day> | (<startMessage> <endMessage>?))? <force>?`
```
<source>       ::= youtube | spotify
<year>         ::= <number>
<month>        ::= <number>
<day>          ::= <number>
<startMessage> ::= <discordMessageLink>
<endMessage>   ::= <discordMessageLink>
<force>        ::= force
```
Creates a YouTube playlist from music played by Rythm.

This playlist is made on YouTube by default, but Spotify can
be used by specifying `spotify` in the command arguments.

By default, the songs added to the playlist are the songs
played by Rhythm on the same day that the playlist was requested.

To specify a date range, you may add up to two links to discord messages.
The first and second messages' timestamps will be used for the
start and end of the date range respectively.
If no second link is provided, the end will default to the time
of the playlist request.

A user may also reply to a message in place of supplying the first
link to a discord message.

Finally, instead of multiple links, a user may specify a single day
formatted `YYYY MM DD` to create a playlist of all songs
played by Rythm on that day.

Example:
```
$playlist spotify 2020 03 15
```

### `$prefix <newPrefix>`
Updates the prefix which Blues will listen to for executing commands.

This prefix should be a single, non-alphanumeric number,
and it should not be one of `@`, `/`, or `#`.

Example:
```
$prefix !
!help
```

### `$prune <setting>`
```
<setting> ::= on | off | replace
```
Enable automatic song announcement deletion, to prevent your chats
from being excessively cluttered.

When set to `replace`, Blues will replace a Rythm announcement with
a much smaller embed.

Example:
```
$prune off
```

### `$rythm <bot>`
Binds Blues to the mentioned Rythm bot.

Blues is intended to default to the most common Rythm bot,
but as there are multiple bot accounts offered by Rythm,
one may choose to bind Blues to one of the alternatives.

Example:
```
$rythm @Rythm#1234
```

### `$timezone <zone>`
TBD

## Development
### Requirements
- [`Node LTS`](https://nodejs.org/en/download/)
- [`Yarn`](https://classic.yarnpkg.com/en/docs/install/)
- [`Docker`](https://www.docker.com/) (Optional)

### Configuring Your Environment
- Create a `.env` file and put it in the root directory of the project.
    - This file should _never_ be committed to version control.
- Copy `.env.sample` to the new `.env` file.
- Modify as necessary to your environment.

### Scripts
- **`yarn install`**: Gathers all dependencies. This should be run at the start of development on a new clone in the root.
- **`yarn lint`**: Lints the `src/` files.
- **`yarn build`**: Compiles the `.ts` files to `.js` files in the `dist/` dir.
- **`yarn watch`**: Runs the bot and restarts it if any files are changed.
- **`yarn authenticate-youtube`**: Launches the authentication server and authenticates Blues with YouTube.
- **`yarn authenticate-spotify`**: Launches the authentication server and authenticates Blues with Spotify.

### Running Blues
#### With Docker
1. TBD
#### Without Docker
1. From the root directory, run `yarn watch`
