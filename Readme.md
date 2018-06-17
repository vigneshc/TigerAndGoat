[Lambs and Tigers](https://en.wikipedia.org/wiki/Lambs_and_Tigers) is an abstract strategy board game.

This project contains an implementation of the game as a learning exercise in [Typescript](https://www.typescriptlang.org/), [ReactJS](https://reactjs.org/) and  [AspNet core](https://docs.microsoft.com/en-us/aspnet/core/?view=aspnetcore-2.1). There is no server side logic, it can as well be a static html app. Dotnet core was chosen just for convenience as it creates initial boiler plate code.

**Folder structure**

*ClientApp/components/AI/* : Contains generic board navigation interface, MinMax code. This is generic and can be used for other games.

*ClientApp/components/TigerAndGoat/* : Contains tiger and goat game related code. Each file has brief description.

**Building and Deploying**

Requires dotnet core, npm and typescript to be installed.

*Compile:* 

`dotnet build`

*Run:*

`dotnet run`

*Packaging and deployment:*

`dotnet publish -c Release`

Creates a folder called `netcoreapp2.0/` with all the dependencies. 

Copy `netcoreapp2.0/` and run below command to start the app.

`dotnet TigerAndGoat.dll`

[**Live demo**](http://gridgames.tk/)


**Possible additions**
* Two player game.
* Better heuristics, levels.
* Undo and replay.
* Additional, similar games.

There is no warranty of any kind for the items in repository.