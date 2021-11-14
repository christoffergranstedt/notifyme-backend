## GitHub viewer

# Project - Notifyme - A Gitlab notification web app

![notfiMe](uploads/1f6283951905c656b233ad2801b7e91f/notfiMe.png)


## Table Of Contents

[[_TOC_]]

___

## 1. Background

Gitlab [[1]](#8-references) is a version control system that developers all over the
world is using to commit changes to their codes when developing software's. On Gitlab teams or alone developers can start projects where they push their code to so that
other can view and get a copy of it or to revert changes. 

A group on Gitlab can be multiple developers or other stakeholders that can view and share the same
project. It is possible to create issues about the code so this issues are
easily tracked and it also possible to make releases for packaging the software’s for
users. And a lot more of different things can be done around the project
of building a software. All this actions creates events and here in when
our application comes in. It is possible to receive a message when a new
action has occurred in a group or project and our web application, named Notifyme will receive the
event and show and notify our users about them.

In our web application it should be possible to choose for which
projects and which type of events the users want to receive notifications about and when this is
done a so called webhook is set at Gitlab that will track and notify our
application when certain events occur. Other than that it should be
possible to connect a user’s Slack [[2]](#8-references) account with our application so
that the user can receive event updates directly in their Slack
environment.

Before this document was written a **technical prestudy** was done and
could be found at the attachments section in this document. To get a better
understanding of some of the words used in this document, the technical prestudy 
could be read first.

## 2. Requirements

### 2.1. Functional Requirements

-   User should be able to list and select his/hers Gitlab groups.

-   Choose to receive notification as, latest release, latest commit for
    projects in the selected group.

-   Application should be able to notify via Facebook Messenger the user
    about certain events that occur in the groups even if the user is
    not running the application.

-   The user should be able to configure which groups events will be
    sent as notification.

-   If user returns at a later date application should show information
    that is new since the last execution.

### 2.2. Non-Functional Requirements

The application is not expected to be a super success in the near future
and are expected to receive quite little traffic. A single user can
however have many project and set many webhooks that will connect with
our application server for every event raised in Gitlab and cause some
load.

The following non-functional requirements are estimated

1.  Load: 10 concurrent requests (mainly from Gitlab webhooks)

2.  No. of users: 5

3.  Accepted message loss: 1%. No need for a super secure message system
    since it only good to have events and are not super important.

## 3. Overall Web Application Architecture

The web application will be built using a microservice architecture.
[[3]](#8-references) A microservice architecture has a number of different services where each microservice should be small and
handle a portion of the application that are connected within. Each microservice can then have
their own database with only models and attributes that are interesting
to the specific service. A microservice could run in a separate
server or virtual machine and if some of the services gets heavy load over time
but other don’t it is then quite easy to scale just this service but not the rest of the application. This is kind of the
opposite of a monolith web application. [[4]](#8-references)

For this project which is estimated to be a quite small amount of code,
a monolithic layered architecture approach was long thought of the way
to go in this project. But two main points made the project owner to
choose a microservice architecture instead. Even if this application is
not expected to get a lot of traffic it is possible to scale a certain
part of the system in a microservice if we are wrong. One part that we
are thinking of is to receive events from Gitlab which could potentially
grow very large if many webhooks are set for different projects. In a
monolithic layered architecture, we have to scale the whole application
instead of just the service handling the receiving of new events. The
other main reason was request from our developer in the team to build a
microservice architecture for the first time.

A microservices architecture can have plenty of different approaches of
how they exactly are implemented. This project will use a
choreography-based Saga-pattern [[5]](#8-references). In this pattern each service is
loosely coupled and communicates over an event bus with certain events
that each service either publish themselves or listens to. This means
that each microservice communicates with the client directly via an
ingress controller but then all microservices themselves communicates
via this event. An API Gateway pattern that sits between the client and
microservice and coordinates and composes the internally request between
the microservice was a serious alternative instead. But since the
developer sees a possibility to handle this without this extra request
layer as the API Gateway kind of is this project will use the
choreography-based saga instead.

Other architectures such as spacebased architecture was considered but seem to not fit this project to fully since it is not an applications that estimating high peeks of traffic load and need storages. A microkernel architecture for having a core part of the software and than adding add-ons for extending the application did not feel right either because the exceptions to produce add-ons later to the project is very low.

The overall architecture for this project can be seen in figure 1. Here
we can see that the client will connect with the different microservice directly.
The client will be a single page application that will fetch the microservices
for data. Depending on the API-URL the client-request will be
transferred to different microservice that handles that route. The microservice will then send a
response back to the client and depending of which route also publish an
event with information that either one or multiple other microservice
will listen to via the event bus. The other microservice will then
perform actions on the event, for example update the data storage for
the specific micro service. For more in-depth information about each
service see next section.

![overall](uploads/155f49969131e22e07bfbc10a0e58eda/overall.png)*Figure 1. An overview of the chosen overall architecture for the web application.*

## 4. Server-side Web Application

The server-side of the application will be deployed with a
choreographed-based saga pattern in an microservice architecture as
mentioned in the earlier section. The requests and responses from the
client will go through the NGINX Ingress [[6]](#8-references) load balancer and ingress
controller and will depending on the provided url transfer the request
to the correct microservice.

An event bus that is implemented with NATS Streaming [[7]](#8-references) will be used
to handle all the communications between each microservice. This could
for instance be done when another microservice needs to update its data
when an event has happened. NATS Streaming has no support for messages
with request / reply where the request service waits for a reply from
another reply. Instead it just publishes the event and information and
then it is up on the services to act on the information. It will give a
very loosely coupled services but NATS Streaming has a lot of features
that will not be used and could potentially not be the optimal solution.
The developer however has some experience in that he has seen it how to
be using just NATS Streaming and therefore that is the projects choice.

Each microservice will be developed inside a Docker [[8]](#8-references) container. To
manage all containers Kubernetes [[9]](#8-references) will be used. Each container will
then be located in a Kubernetes pod. See figure 2 for an overview of all
parts on server-side. A more in-depth information each service, what
they role is, what technology stack used, and which routes they have
will be provided below.


![server](uploads/38a58bd122e311866011f9f15cc0563e/server.png)*Figure 2. An overview of the server side web server*

### 4.1. Services Drill Down

#### 4.1.1. Event Service

![event](uploads/012912305d6c6876b4d5bf11c69980ff/event.png)*Figure 3. The event service structure*

**Role**

The role for the event service is to act as the receiver for all
incoming Gitlab events via the connected webhooks. When an event is
received from Gitlab the service will filter out to keep the most
necessary attributes of the event and publish a GitlabEventReceiveEvent.
Will store all events connected to a user that will be available for
outside request. Will also store information about when the user was
last logged in so it can mark events that are new to user.

**Technology Stack**

The service will be run in Node [[10]](#8-references) with the Express framework
[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
Mongoose [[13]](#8-references) to communicate with the MongoDb. As seen in figure 3 all
request need to have an Jsonwebtoken [[14]](#8-references) to authenticate that this a
real user. The service has one API routes interface-layer, a service
layer and database access layer that handles all connection with the
database.


<table>
<thead>
<tr class="header">
<th><strong>Routes</strong></th>
<th><strong>Description</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>GET /api/events</td>
<td>Get all events for the authenticated user.</td>
</tr>
<tr class="even">
<td>POST /api/events</td>
<td><p>Listens to when a Gitlab Event is received and publish an event, GitlabEventRecievedEvent</p>
<p>internally.</p></td>
</tr>
</tbody>
</table>

| **Events Published**     | **Description**                                                                                                                                |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| GitlabEventRecievedEvent | When Gitlab sends an event update via the webhook this service will emit that a new event has been received with a selection of event details. |
| NewErrorEvent            | When a new error occurs in the service                                                                                                         |

| **Events Listened**             | **Description**                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| EventUserReadyEvent             | Listen for this event that has users that want this this event. Will store the event under the users.                                  |
| UserNotActiveOnSiteEvent        | Listen to this event and will store the date and time when the user went offline from the site.                                        |
| UpdatedNotifcationSettingsEvent | Will listen for notification settings update. Will delete events from user if user no longer wants notifications about certain events. |

| **Models**  | **Description**                                 |
|-------------|-------------------------------------------------|
| User        | userId, lastActiveOnSite, events(EventSchema)   |
| EventSchema | Id, eventType, author, date, groupId, projectId |

#### 4.1.2. Group & Project Service
![group](uploads/b818e7c211519a134d2edd16d89dd0f7/group.png)*Figure 4. The group & project service structure*

**Role**

The service role is to be a bridge for Gitlab API and will perform
request to Gitlab about groups and projects that will be provided for
our web application. It will store information about user and the access
token and refresh token for each user to the Gitlab API.

**Technology Stack**

The service will be run in Node [[10]](#8-references) with the Express framework
\[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
Axios [[15]](#8-references) make requests to Gitlab API. As seen in figure 4 all
request need to have an Jsonwebtoken [[14]](#8-references) to authenticate that this a
real user. The service has one API routes interface-layer and one
service layer.

| **Routes**                         | **Description**                                                      |
|------------------------------------|----------------------------------------------------------------------|
| GET /api/groups                    | Get a list of group names connected to authenticated user.           |
| GET /api/projects/groups/{groupId} | Get all projects connected to a group seen by an authenticated user. |

| **Events Published** | **Description**                        |
|----------------------|----------------------------------------|
| NewErrorEvent        | When a new error occurs in the service |

| **Events Listened**             | **Description**                                                                                                                                     |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| UpdatedNotifcationSettingsEvent | When a user updates a notification, this service should check if a hook to Gitlab already exist and either set, update or delete webhook to Gitlab. |

| **Models** | **Description** |
|------------|-----------------|
| User       | userId, accessToken, refreshToken 

**External dependencies**

Gitlab API Server

#### 4.1.3. Auth Service

![auth](uploads/5c293fea1ebdd84a1a7b801fef7f9664/auth.png)*Figure 5. The auth service structure*

**Role**

The auth service role is to handle everything about user authentication.
Create new user accounts, authenticate users and return access tokens
and refresh tokens that will be used by other services to authenticate
it is a legitim user. It will also handle the authentication flow when
user want to connect their Gitlab and Slack accounts with this
application.

**Technology Stack**

The service will be run in Node [[10]](#8-references) with the Express framework
[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
Mongoose [[13]](#8-references) to communicate with the MongoDb. As seen in figure 5 all
request need to have an Jsonwebtoken [[14]](#8-references) to some of the routes to
authenticate that this a real user. The service has one API routes
interface-layer and a service layer.

| **Routes**                                      | **Description**                                                                                                                         |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| POST /api/accounts/register                     | To register a new user.                                                                                                                 |
| POST /api/accounts/authenticate                 | To authenticate a user by user providing username and password.                                                                         |
| GET /api/accounts/signout                       | To sign out a user (remove refresh token on server side).                                                                               |
| POST /api/accounts/refresh                      | Use with refresh token to refresh access token to stay logged in.                                                                       |
| GET /api/accounts/gitlab/start-authenticate     | Start authentication with users Gitlab account with starting up states etc and returning a redirect-URL.                                |
| POST /api/accounts/gitlab/authenticate-callback | Finish the authentication of Gitlab account, and when done emit a SlackAuthenticatedEvent with the Gitlab accessToken and refreshToken. |
| GET /api/accounts/slack/start-authenticate      | Start authentication with users Slack account with starting up states etc and returning a redirect-URL.                                 |
| POST /api/accounts/slack/authenticate-callback  | Finish the authentication of the Slack account.                                                                                         |

| **Events Published**     | **Description**                                                                                                                                            |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitlabAuthenticatedEvent | When user has gone through the authentication for Gitlab this event will be published containing access token and refresh token for the Gitlab connection. |
| SlackAuthenticatedEvent  | When user has gone through the authentication for Slack this event will be published containing slack url for the users workspace account.                 |
| UserNotActiveOnSiteEvent | When a user signs out this event will be raised.                                                                                                           |
| NewErrorEvent            | When a new error occurs in the service                                                                                                                     |

| **Events Listened** | **Description** |
|---------------------|-----------------|
| None                |                 |

| **Models** | **Description**      |
|------------|----------------------|
| Account    | userId, refreshToken |

#### 4.1.4. Notification Setting Service

![notification_settings](uploads/7166e3cdb35c123fb9d51dbbb01102cb/notification_settings.png)*Figure 6. The notification settings service structure*

**Role**

This service role is to keep records about users chosen settings. Which
projects and which kind of events they want to see.

**Technology Stack**

The service will be run in Node [[10]](#8-references) with the Express framework
[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
Mongoose [[13]](#8-references) to communicate with the MongoDb. As seen in figure 6 all
request need to have an Jsonwebtoken [[14]](#8-references) to authenticate that this a
real user. The service has one API routes interface-layer, a service
layer and database access layer that handles all connection with the
database.

| **Routes**                                                       | **Description**                                                             |
|------------------------------------------------------------------|-----------------------------------------------------------------------------|
| GET /api/notification-settings/{groupId}                         | To get the users stored notification settings for a group and its projects. |
| POST /api/ notification-settings/{groupId} /projects/{projectId} | To update a projects notification setting.                                  |

| **Events Published**            | **Description**                                                                                                                                      |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| UpdatedNotifcationSettingsEvent | When a notification setting is updated for a user this event will be published with information about the group and project and what type of events. |
| EventUserReadyEvent             | When this service has received a GitlabEventReceviceEvent it will attach users that wants information about the event and release this event.        |
| NewErrorEvent                   | When a new error occurs in the service                                                                                                               |

| **Events Listened**      | **Description**                                                |
|--------------------------|----------------------------------------------------------------|
| GitlabEventRecievedEvent | When a Gitlab is received this service will collect the event. |

| **Models** | **Description**                                 |
|------------|-------------------------------------------------|
| User       | userId, groups(Group)                           |
| Group      | groupId, projects(Project)                      |
| Project    | projectId, wantsReleaseEvents, wantsIssueEvents |

#### 4.1.5. Websocket Notification Service

![websocket](uploads/75b6e52998d5bd011fec21b86fc0007f/websocket.png) *Figure 7. The websocket notification service structure*

**Role**

This service is a websocket server that handles websocket connections
with the client. Through the websocket this service can push information
about new events to client for update in real time with need to refresh.
Will authenticate the websocket connection with provided token and will
create a new room for a user when they are active. When user is not
active the room will automatically be closed.

**Technology Stack**

The service will be run in Node \[10\] with the Express framework
[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
socket.io [[16]](#8-references) to establish the websocket connection to the client.
The service will authenticate all websocket connections with
Jsonwebtoken [[14]](#8-references).

| **Routes** | **Description** |
|------------|-----------------|
| None       | \-              |

| **Events Published**     | **Description**                                                                                                                     |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| UserNotActiveOnSiteEvent | When the user disconnects socket connection and there is not any other connection in userId socket room this event will be emitted. |
| NewErrorEvent            | When a new error occurs in the service                                                                                              |

| **Events Listened** | **Description**                                                                                                                                                                |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| EventUserReadyEvent | Listens to when a Gitlab Event is received and which users that wants to receive a UI update about that event and sends an update vid websocket room (a room for each user id) |

| **Models** | **Description** |
|------------|-----------------|
| None       | \-              |

#### 4.1.6. Slack Notification Service

![slack](uploads/aed9663a41774c7d909b4fc5711321b9/slack.png)*Figure 8. The Slack notification service structure*

**Role**

The Slack notification service will send information about new events to
the users connected Slack workspace. Will store the slack id for be able
to send to the users specific workspace.

**Technology Stack**

The service will be run in Node [[10]](#8-references) with the Express framework
[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
Axios [[15]](#8-references) to inform Slack about events to notify about. It will use
Mongoose [[16]](#8-references) to communicate with the MongoDb. The service has one
service layer and a database access layer.

| **Routes** | **Description** |
|------------|-----------------|
| None       | \-              |

| **Events Published** | **Description**                        |
|----------------------|----------------------------------------|
| NewErrorEvent        | When a new error occurs in the service |

| **Events Listened**               | **Description**                                                                                                   |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------|
| GitlabEventNotificationReadyEvent | Listens to when a Gitlab Event is received and which users that wants to receive a notification about that event. |

| **Models**   | **Description** |
|--------------|-----------------|
| Notification | userId, slackId |

#### 4.1.7. Logging Service

![logging](uploads/81187bc2af09d65f82b4316b794650f5/logging.png)*Figure 9. The logging service structure*

**Role**

Will store all errors that happens in the application.

**Technology Stack**

The service will be run in Node [[10]](#8-references) with the Express framework
[[11]](#8-references). The service will be built with Typescript [[12]](#8-references) and will use
Mongoose [[13]](#8-references) to communicate with the MongoDb. The service has one
service layer and a database access layer but no API for outside
communication.

| **Routes** | **Description** |
|------------|-----------------|
| None       | \-              |

| **Events Published** | **Description** |
|----------------------|-----------------|
| None                 | \-              |

| **Events Listened** | **Description**                                                                               |
|---------------------|-----------------------------------------------------------------------------------------------|
| NewErrorEvent       | When a new error occurs this service will listen to this event and record it in the database. |

| **Models** | **Description**                   |
|------------|-----------------------------------|
| Log        | id, date, errorType, errorMessage |

## 5. Client-side Web Application

The client side of the application will be written in React [[17]](#8-references) which
is one of the most used client side frameworks. It is great for building
reusable components and builds a virtual DOM for speeding the
visualization of the user interface. For handling routing between
different URL a library called React-router-dom [[18]](#8-references) will be used.

For handling of the fetching of data and cache of the application a
library called React-query will be used. [[19]](#8-references) For an overview of the
pages and the main components in the client see figure 10. For a more
in-depth information about each page see next section.

Other alternatives that was seriously considered was Vue and NextJS. But since the developer has knownledge in React from before and that the developers already has some new things to learn in other parts of this project, React was the chosen framework. Also much due to the developers wish to improve his skill in this popular framework. However will Typescript also be used together with React for improving the type safety.

![client](uploads/44b8bf9796da663baf522d0267d0228a/client.png)*Figure 10. An overview of the pages and components on the client side*

### 5.1. Pages Drill Down

#### 5.1.1. Home Page

Will just display a welcome screen and some information about the
application. Will have a header where it is possible to sign up or sign
in.

| **Routes** | **Description** |
|------------|-----------------|
| /          | Main page       |

#### 5.1.2. Auth Page

Will have option to either sign up or sign in.

| **Routes** | **Description**                                          |
|------------|----------------------------------------------------------|
| /auth      | Sign up or sign in. Only viewable by not logged in user. |

#### 5.1.3. Dashboard Page

Will display events connected to user for a group and if an event the
user has seen before or not. Will also provide possibility to change
group if the users has many different groups.

| **Routes**          | **Description**                       |
|---------------------|---------------------------------------|
| /dashboard/{userId} | Only viewable by authenticated users. |

#### 5.1.4. Profile Page

On the profile page a user can authenticate the Gitlab and Slack account
and see some basic information about the user account.

| **Routes**        | **Description**                       |
|-------------------|---------------------------------------|
| /profile/{userId} | Only viewable by authenticated users. |

#### 5.1.5. Group & Projects Notification Settings Page

On this page the authenticated user can view a specific groups and all
the connected projects inside this group and then choose which
notifications the user wants to see or not.

| **Routes**        | **Description**                       |
|-------------------|---------------------------------------|
| /groups/{groupId} | Only viewable by authenticated users. |

## 6. Application Flows

### 6.1. Sign Up Flow
![sign_up](uploads/07c83185ec949c8b5212b7c1f5a423a4/sign_up.png)*Figure 11. Sign up flow in the application*

1.  User provides a username and a password which is sent to the auth
    service sign up route.

2.  The auth services stores the new user in the database.

3.  The auth service send a response to the client.

### 6.2. Authenticate Flow
![authenticate](uploads/b88b9b2145e99d44a9afb559dea7961e/authenticate.png)*Figure 12. Authenticate flow in the application*

1.  User provides username and password which is sent to the auth
    service authenticate route.

2.  Auth service checks if username exist and password is correct and
    creates a Jsonwebtoken access token and a refresh token and stores
    the refresh token on the user.

3.  The auth service send a response with the access token and its
    expiration time, and a refresh token to client.

### 6.3. Sign Out Flow
![sign_out](uploads/367c7b5c6bca3c3e00da26a232895271/sign_out.png)*Figure 13. Sign out flow in the application*

1.  User clicks sign out and a request to Auth Service is sent.

2.  Auth service authenticates the user and checks in the database if
    user exist. If so, it deletes the refresh token from the user.

3.  Auth service sends back a success response to the client.

4.  Auth service publish a UserNotActiveOnSiteEvent.

5.  Event service listen to this event.

6.  Event service updates the services database with the date for when user was last active on site.

### 6.4. Refresh Access Token Flow
![refresh](uploads/6e586a5f977cc195aa89ffe07df57f46/refresh.png)*Figure 14. Refresh access token flow in the application*

1.  Before or after the access token has expired the client send a
    request with refresh token to auth service refresh route.

2.  The auth service look up the refresh token and validate it and
    creates a new access token and refresh token.

3.  <span id="_Toc65242324" class="anchor"></span>The auth service send
    a response with the access token and its expiration time, and a
    refresh token to client.

### 6.5. Authenticate Gitlab Flow
![auth_gitlab](uploads/02e753f6d7f9c3d62515b1f903459f4c/auth_gitlab.png)*Figure 15. Authenticate Gitlab flow in the application*

1.  When user request to start authentication the request goes to auth service.

2.  Server responds with a redirect URL with some state etc.

3.  Client follows redirect URL to Gitlab Client and are asked to authorize the application.

4.  After authorizing client is sent back to Notifyme client again with a code.

5.  Send the code to the auth service.

6.  Auth service sends the code to Gitlab Server to finalize the authentication.

7.  Auth service receives an Gitlab access token and refresh token.

8.  Respond success to Notifyme client.

9.  Auth service emits GitlabAuthenticatedEvent with the tokens inside.

10. Group & project service listen for this event.

11. Group & project settings stores the token in the local database.


### 6.6. Authenticate Slack Flow
![auth_slack](uploads/2c08aa72ccba03d2100a223c9ca0fa2e/auth_slack.png)*Figure 16. Authenticate Slack flow in the application*

1.  When user request to start authentication the request goes to auth service.

2.  Server responds with a redirect URL with some state etc.

3.  Client follows redirect URL to Slack Client and are asked to authorize the application.

4.  After authorizing client is sent back to Notifyme client again with a code.

5.  Send the code to the auth service.

6.  Auth service sends the code to Slack Server to finalize the authentication.

7.  Auth service receives an Slack URL to the users workspace.

8.  Respond success to Notifyme client.

9.  Auth service emits SlackAuthenticatedEvent with the tokens inside.

10. Slack notification service listen for this event.

11. Slack notification service stores the Slack URL in the local database.


### 6.7. List Group and Projects Notification Settings Flow
![list_group](uploads/331d1ea1a638d67d7ae5a8ba91e1f1e1/list_group.png)*Figure 17. List group and projects notification settings flow in the application*

1.  User request to view his groups and projects notification settings and request is sent to notification settings service.

2.  The service fetch users data from database.

3.  Responds to client with the data.

### 6.8. Update Notification Settings Flow
![update_notification](uploads/b198a7f813b6b385c01178a1cdf65ff3/update_notification.png) *Figure 18. Update notification settings flow in the application*

1.  User request to change a notification setting and request is sent to notification settings service.

2.  Notification settings service updates the users data in the database.

3.  Responds with success to client.

4.  Notification settings service emits the event UpdateNotificationSettingsEvent with information about the user and changed setting.

5. Group & project service listen for this event.

6.  Depending on users change in notification and if a webhook for this project already exist it sets a new, update or delete the webhook with a request to Gitlab server.

7.  Event service listen also to UpdateNotificationSettingsEvent.

8.  Eventual delete some events connected to a user if the user want to remove events.

### 6.9. Receive Gitlab Event Flow
![receive_event](uploads/d664ad0a226e6b68aec060214daa2c11/receive_event.png)*Figure 19. Receive Gitlab event flow in the application*

1.  Gitlab Server sends a webhook response to Event Service when a new event has been triggered.

2.  Event service keeps the important attributes on the event and emits GitlabEventReceivedEvent with this filtered data.

3.  Notification settings service listen for this data.

4.  Depending on project and event type it fetches users that are interested in this event.

5.  Notification settings service emits EventUserReadyEvent with info about the event and users that are wants to see the event.

6.  Event Service listens to EventUserReadyEvent

7.  Event service stores the event to users.

8.  Websocket notification server listens also to EventUserReadyEvent.

9.  Notify the attached users that are online via the websocket connections to the Notifyme client.

10. Slack notification service also listen to EventUserReadyEvent.

11.  Notifies the users Slack workspace about the event. 

## 7. Attachments

-   [Technical Prestudy](Technical-Prestudy)


## 8. References

>  [1] “GitLab.com.” 
>  https://about.gitlab.com/ 
>  (accessed Feb. 26, 2021)

>  [2] “Where work happens \| Slack.” 
>  https://slack.com/intl/en-se/
>  (accessed Feb. 26, 2021)

>  [3] “What are microservices?”
>  https://microservices.io/ 
>  (accessed Feb. 26, 2021)

>  [4] “Microservices vs Monolithic architecture \| MuleSoft.”
>  https://www.mulesoft.com/resources/api/microservices-vs-monolithic
>  (accessed Feb. 26, 2021)

>  [5] “Sagas.”
>  https://microservices.io/patterns/data/saga.html
>  (accessed Feb. 26,2021)

>  [6] “NGINX Ingress Controller - NGINX.”
>  https://www.nginx.com/products/nginx-ingress-controller/ 
>  (accessed Feb. 26, 2021)

>  [7] “Introduction - NATS Streaming Docs.”
>  https://docs.nats.io/nats-streaming-concepts/intro 
>  (accessed Feb. 26, 2021)

>  [8] “Empowering App Development for Developers \| Docker.”
>  https://www.docker.com/ 
>  (accessed Feb. 26, 2021)

>  [9] “Kubernetes.”
>  https://kubernetes.io/ 
>  (accessed Feb. 26, 2021)

>  [10] “Node.js.”
>  https://nodejs.org/en/ 
> (accessed Feb. 26, 2021)

>  [11] “Express -
>  Node.js web application framework.” 
>  https://expressjs.com/ 
>  (accessed Feb. 26, 2021)

>  [12] “TypeScript: Typed JavaScript at Any Scale.”
>  https://www.typescriptlang.org/ 
>  (accessed Feb. 26, 2021)

>  [13] “Mongoose ODM v5.11.18.”
>  https://mongoosejs.com/ 
>  (accessed Feb. 26,2021)

>  [14] “JSON Web Token (JWT).” 
>  https://www.jsonwebtoken.io/
>  (accessed Feb. 26, 2021)

>  [15] “GitHub - axios/axios: Promise based
>  HTTP client for the browser and node.js.” https://github.com/axios/axios
>  (accessed Feb. 26, 2021)

>  [16] “Socket.IO.” 
>  https://socket.io/
>  (accessed Feb. 26, 2021)

>  [17] “React – A JavaScript library for building user interfaces.” 
>  https://reactjs.org/ 
>  (accessed Feb. 26, 2021)

>  [18] “React Router: Declarative Routing for React.js.”
>  https://reactrouter.com/web/guides/quick-start 
>  (accessed Feb. 26, 2021)

>  [19] “React Query - Hooks for fetching, caching and updating asynchronous data in React.” 
>  https://react-query.tanstack.com/ 
>  (accessed Feb. 26, 2021)