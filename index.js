const Sequelize = require('sequelize')

/**
 * ----------------------------------------------------------------
 * Database Connection
 * ----------------------------------------------------------------
 */
let db_user = 'root',
    db_pass = '',
    db_name = 'unpossible'

const db = new Sequelize(db_name, db_user, db_pass, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
})

/**
 * ----------------------------------------------------------------
 * Check DB Connection
 * ----------------------------------------------------------------
 */
db.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.')
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err)
    })

/**
 * ----------------------------------------------------------------
 * Define models
 * ----------------------------------------------------------------
 */
const Blog = db.define('blogs', {
    title: {
        type: Sequelize.STRING,
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: false,
        notNull: {
            msg: 'Body is required',
        },
        notEmpty: {
            msg: 'Body is required',
        },
    },
})
const Category = db.define('categories', {
    name: {
        type: Sequelize.STRING,
    },
})

const BlogCategory = db.define('blog_category', {})

const User = db.define('users', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Name is required',
            },
            notEmpty: {
                msg: 'Name is required',
            },
        },
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            msg: 'Already exists',
        },
        validate: {
            notNull: {
                msg: 'Email is required',
            },
            notEmpty: {
                msg: 'Email is required',
            },
            isEmail: {
                msg: 'Email is not valid',
            },
        },
    },
})
/**
 * ----------------------------------------------------------------
 * Relationship
 * ----------------------------------------------------------------
 */
/*
    O:O, set up a Parent.hasOne(Child) AND Child.belongsTo(Parent).
    O:M, set up Parent.hasMany(Child) AND Child.belongsTo(Parent)
*/

// One to Many
User.hasMany(Blog)
Blog.belongsTo(User)

// Many to many
Blog.belongsToMany(Category, { through: BlogCategory })
Category.belongsToMany(Blog, { through: BlogCategory })

/**
 * ----------------------------------------------------------------
 * Migrate database
 * ----------------------------------------------------------------
 */
db.sync()

/**
 * ----------------------------------------------------------------
 * Format Errors
 * ----------------------------------------------------------------
 */

const formatErrors = err => {
    let errors = err.errors
    let errorJson = {}
    if (errors) {
        errors.map(({ message, path }) => {
            errorJson[path] = message
        })
    }
    return errorJson
}

const formatResponse = data => {}

/**
 * ----------------------------------------------------------------
 * CRUD
 * ----------------------------------------------------------------
 */

// ------------------- Create

function createUser() {
    User.create({
        name: 'Omar',
        email: 'ray1han095477@gmail.com',
    })
        .then(res => console.log(res))
        .catch(e => console.log(formatErrors(e)))
}

// createUser()

function createPost() {
    Blog.create({
        title: 'Blog 4',
        body: 'Blog body',
        userId: 4, // foreignKey
    })
        .then(res => {
            console.log(res)
        })
        .catch(e => console.log(formatErrors(e)))
}
// createPost()

// ------------------- Read
// https://gist.github.com/zcaceres/83b554ee08726a734088d90d455bc566
function allPostsWithAuthor() {
    Blog.findAll({
        include: [User, Category],
        orderBy: [['id', 'DESC']],
    })
        .then(res => console.log(JSON.stringify(res, undefined, 4)))
        .catch(e => console.log(e))
}
// allPostsWithAuthor()

function fetchAUser() {
    User.findOne({
        where: { id: 4 },
        include: [Blog],
    })
        .then(res => console.log(JSON.stringify(res, undefined, 4)))
        .catch(e => console.log(e))
}
// fetchAUser()

function createCategory() {
    Category.create({
        name: 'cat2',
    })
}
// createCategory()

async function assigncategories() {
    let blog = await Blog.create({
        title: 'Test 2',
        body: 'Test body 2',
        userId: 5,
    })

    blog.setCategories([1, 2])

    console.log(blog)
}

// assigncategories()

async function updatePost() {
    let post = await Blog.update(
        {
            title: 'title Updated',
        },
        {
            where: { id: 5 },
        }
    )
    console.log(post)
}
// updatePost()

async function updatePostCategories() {
    let post = await Blog.findOne({
        where: { id: 16 },
        include: [User, Category],
        // attributes: { exclude: ['userId'] },
        // attributes: ['title', 'body', ['id', 'name']],
    })
    post.setCategories([1, 2])

    console.log(JSON.stringify(post, undefined, 4))
}

updatePostCategories()
