import fs from "fs";
import path from "path";
import { google } from "googleapis";
import readline from "readline";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "token.json"
);

// function to authorize the client
async function authorize() {
  // read the credentials file
  const credentials = JSON.parse(fs.readFileSync("credentials.json"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  } else {
    // if no token, get a new access token
    return await getAccessToken(oAuth2Client);
  }
}

// function to get access token
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question("enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return reject(err);
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        resolve(oAuth2Client);
      });
    });
  });
}

// function to add an event to google calendar
async function addEvent(auth, task) {
  const calendar = google.calendar({ version: "v3", auth });
  const event = {
    summary: task.task,
    start: {
      dateTime: task.time,
      timeZone: "America/New_York",
    },
    end: {
      dateTime: new Date(
        new Date(task.time).getTime() + 30 * 60 * 1000
      ).toISOString(),
      timeZone: "America/New_York",
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    console.log("event created: %s", res.data.htmlLink);
    return res.data.id;
  } catch (error) {
    console.log("error creating event: ", error);
  }
}

// function to update an event in google calendar
async function updateEvent(auth, task) {
  const calendar = google.calendar({ version: "v3", auth });
  const event = {
    summary: task.task,
    start: {
      dateTime: task.time,
      timeZone: "America/New_York",
    },
    end: {
      dateTime: new Date(
        new Date(task.time).getTime() + 30 * 60 * 1000
      ).toISOString(),
      timeZone: "America/New_York",
    },
  };

  try {
    const res = await calendar.events.update({
      calendarId: "primary",
      eventId: task.eventId,
      resource: event,
    });
    console.log("event updated: %s", res.data.htmlLink);
  } catch (error) {
    console.log("error updating event: ", error);
  }
}

// function to delete an event from google calendar
async function deleteEvent(auth, eventId) {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
    console.log("event deleted");
  } catch (error) {
    console.log("error deleting event: ", error);
  }
}

export { authorize, addEvent, updateEvent, deleteEvent };
