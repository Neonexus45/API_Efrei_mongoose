# API Efrei Mongoose

## Overview
This API provides a RESTful interface to manage Users, Albums, and Photos. It's built with Express.js and Mongoose.

## Features
- User management: Create, retrieve, delete users.
- Album management: Create, retrieve, update, delete albums.
- Photo management: Add photos to albums, retrieve photos from albums, update photo details, delete photos.

## Requirements
* Node.js (version 18 or higher recommended, as per original README)
* npm, yarn, or pnpm
* Git
* MongoDB (ensure your `src/config.mjs` is configured with the correct MongoDB connection string)

## Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
2. Navigate to the project directory:
   ```bash
   cd API_Efrei_mongoose
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   Or if you use yarn:
   ```bash
   yarn install
   ```
   Or if you use pnpm:
   ```bash
   pnpm install
   ```

## Running the Application

### Development Mode
This command will lint the code and then start the server using `index.mjs`.
```bash
npm run dev
```

### Production Mode
This command will start the server in production mode.
```bash
npm run prod
```

### Linting
To only lint the code:
```bash
npm run lint
```

## API Endpoints

All request and response bodies are in `application/json` format.

### Users

#### `POST /user/`
Create a new user.
* **Requires authentication?** No
* **Who can use it?** Owner and users

**Request Body:**
```json
{
  "firstname": "String", // Optional
  "lastname": "String", // Optional
  "avatar": "String", // Optional
  "age": "Number", // Optional
  "city": "String" // Optional
}
```

**Response Body (Success: 200 OK):**
```json
{
  "id": "ObjectId",
  "firstname": "String",
  "lastname": "String",
  "avatar": "String",
  "age": "Number",
  "city": "String"
}
```
**Response Body (Error):**
```json
{
  "code": "Number", // e.g., 400 for Bad Request, 500 for Internal Server Error
  "message": "String"
}
```

#### `GET /user/:id`
Retrieve a user by their ID.
* **Requires authentication?** No
* **Who can use it?** Owner and users

**URL Parameters:**
* `id` (String, Required): The ID of the user to retrieve.

**Response Body (Success: 200 OK):**
```json
{
  "id": "ObjectId",
  "firstname": "String",
  "lastname": "String",
  "avatar": "String",
  "age": "Number",
  "city": "String"
}
```
Or an empty object `{}` if not found.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `DELETE /user/:id`
Delete a user by their ID.
* **Requires authentication?** No
* **Who can use it?** (Assumed Owner/Admin, not specified in code logic)

**URL Parameters:**
* `id` (String, Required): The ID of the user to delete.

**Response Body (Success: 200 OK):**
The deleted user object or an empty object `{}` if not found.
```json
{
  "id": "ObjectId",
  "firstname": "String",
  "lastname": "String",
  "avatar": "String",
  "age": "Number",
  "city": "String"
}
```

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

### Albums

#### `POST /album/`
Create a new album.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**Request Body:**
```json
{
  "title": "String", // Required
  "description": "String" // Optional
}
```

**Response Body (Success: 201 Created):**
```json
{
  "id": "ObjectId",
  "title": "String",
  "description": "String",
  "photos": [], // Array of Photo ObjectIds
  "created_at": "ISODate"
}
```
**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `GET /albums/`
Retrieve all albums, sorted by title. Photos within albums are populated.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**Response Body (Success: 200 OK):**
An array of album objects.
```json
[
  {
    "id": "ObjectId",
    "title": "String",
    "description": "String",
    "photos": [
      {
        "id": "ObjectId",
        "title": "String",
        "url": "String",
        "description": "String",
        "created_at": "ISODate",
        "album": "ObjectId" // Refers to parent album id
      }
      // ... other photos
    ],
    "created_at": "ISODate"
  }
  // ... other albums
]
```
Or an empty array `[]` if no albums exist.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `GET /album/:id`
Retrieve a specific album by its ID. Photos within the album are populated.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `id` (String, Required): The ID of the album to retrieve.

**Response Body (Success: 200 OK):**
```json
{
  "id": "ObjectId",
  "title": "String",
  "description": "String",
  "photos": [
    {
      "id": "ObjectId",
      "title": "String",
      "url": "String",
      "description": "String",
      "created_at": "ISODate",
      "album": "ObjectId" // Refers to parent album id
    }
    // ... other photos
  ],
  "created_at": "ISODate"
}
```
Or an empty object `{}` if not found.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `PUT /album/:id`
Update an existing album by its ID.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `id` (String, Required): The ID of the album to update.

**Request Body:**
```json
{
  "title": "String", // Optional
  "description": "String" // Optional
}
```

**Response Body (Success: 200 OK):**
The updated album object.
```json
{
  "id": "ObjectId",
  "title": "String",
  "description": "String",
  "photos": [], // Array of Photo ObjectIds (existing photos are preserved)
  "created_at": "ISODate"
}
```
Or an empty object `{}` if not found.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `DELETE /album/:id`
Delete an album by its ID. (Note: This does not delete associated photos from the Photo collection).
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `id` (String, Required): The ID of the album to delete.

**Response Body (Success: 200 OK):**
The deleted album object or an empty object `{}` if not found.
```json
{
  "id": "ObjectId",
  "title": "String",
  "description": "String",
  "photos": [],
  "created_at": "ISODate"
}
```

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

### Photos (within Albums)

#### `POST /albums/:idalbum/photo`
Add a new photo to a specific album.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `idalbum` (String, Required): The ID of the album to add the photo to.

**Request Body:**
```json
{
  "title": "String", // Required
  "url": "String", // Required
  "description": "String" // Optional
}
```

**Response Body (Success: 201 Created):**
The updated parent album object, with the new photo ID added to its `photos` array.
```json
{
  "id": "ObjectId", // Album ID
  "title": "String",
  "description": "String",
  "photos": [
    "ObjectId", // Existing photo IDs
    "ObjectId"  // New photo ID
  ],
  "created_at": "ISODate"
}
```
**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `GET /albums/:idalbum/photos`
Retrieve all photos for a specific album. Each photo object includes a reference to its parent album.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `idalbum` (String, Required): The ID of the album.

**Response Body (Success: 200 OK):**
An array of photo objects.
```json
[
  {
    "id": "ObjectId",
    "title": "String",
    "url": "String",
    "description": "String",
    "created_at": "ISODate",
    "album": {
      "id": "ObjectId", // Album ID
      "title": "String",
      // ... other album fields (if populated, depends on Mongoose query)
    }
  }
  // ... other photos in the album
]
```
Or an empty array `[]` if no photos exist for the album.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `GET /albums/:idalbum/photo/:idphoto`
Retrieve a specific photo by its ID, from a specific album. The photo object includes a reference to its parent album.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `idalbum` (String, Required): The ID of the album.
* `idphoto` (String, Required): The ID of the photo to retrieve.

**Response Body (Success: 200 OK):**
```json
{
  "id": "ObjectId",
  "title": "String",
  "url": "String",
  "description": "String",
  "created_at": "ISODate",
  "album": {
    "id": "ObjectId", // Album ID
    "title": "String",
    // ... other album fields
  }
}
```
Or an empty object `{}` if not found.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `PUT /album/:idalbum/photo/:idphoto`
Update a specific photo by its ID, within a specific album.
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `idalbum` (String, Required): The ID of the album (Note: current implementation doesn't strictly use `idalbum` to locate the photo for update, only `idphoto`).
* `idphoto` (String, Required): The ID of the photo to update.

**Request Body:**
```json
{
  "title": "String", // Optional
  "url": "String", // Optional
  "description": "String" // Optional
}
```

**Response Body (Success: 200 OK):**
The updated photo object.
```json
{
  "id": "ObjectId",
  "title": "String",
  "url": "String",
  "description": "String",
  "created_at": "ISODate",
  "album": "ObjectId" // Album ID
}
```
Or an empty object `{}` if not found.

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

#### `DELETE /albums/:idalbum/photo/:idphoto`
Delete a specific photo by its ID, from a specific album. (Note: This also needs to remove the photo's ID from the parent album's `photos` array, which is not explicitly handled in the current controller logic but should be considered for data integrity).
* **Requires authentication?** No (Assumed, not specified)
* **Who can use it?** (Assumed Owner/Admin/Users, not specified)

**URL Parameters:**
* `idalbum` (String, Required): The ID of the album.
* `idphoto` (String, Required): The ID of the photo to delete.

**Response Body (Success: 200 OK):**
The deleted photo object or an empty object `{}` if not found.
```json
{
  "id": "ObjectId",
  "title": "String",
  "url": "String",
  "description": "String",
  "created_at": "ISODate",
  "album": "ObjectId"
}
```

**Response Body (Error):**
```json
{
  "code": "Number",
  "message": "String"
}
```

## Project Structure
```
.
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Git ignore file
├── index.mjs            # Main entry point for the application
├── package-lock.json    # Exact versions of dependencies
├── package.json         # Project metadata and dependencies
├── README.md            # This file
└── src/
    ├── config.mjs       # Application configuration (e.g., MongoDB URI)
    ├── server.mjs       # Express server setup and middleware
    ├── controllers/       # Route handlers
    │   ├── albums.mjs
    │   ├── photos.mjs
    │   ├── routes.mjs   # Main router that aggregates other controllers
    │   └── users.mjs
    └── models/            # Mongoose schemas and models
        ├── album.mjs
        ├── photo.mjs
        └── user.mjs
```

## Author
Cyril Vimard (as per `package.json`)

## License
ISC (as per `package.json`)