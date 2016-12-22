const mongoose = require('../database/mongoose')
const db = mongoose.connection;

let ArticleSchema = new mongoose.Schema({
    title: {type: String},
    cover: {type: String},
    keywords: [{type: String}],
    page: {name: String, text: String},
    tab: {name: String, text: String},
    type: {name: String, text: String},
    timestamp: {type: Number},
    date: {type: String},
    content: {type: String},
    desc: {type: String}
})

const ArticleModel = db.model('Article', ArticleSchema);

export function findById(id) {
    return ArticleModel.findById(id)
}

export function find(query) {
    let keywords = query.keywords
    let page, tab, type;
    if(query.page) {
        page = {name: query.page.name, text: query.page.text}
        delete query.page
    }
    if(query.tab) {
        tab = {name: query.tab.name, text: query.tab.text}
        delete query.tab
    }
    if(query.type) {
        type = {name: query.type.name, text: query.type.text}
        delete query.type
    }
    let articleQuery;
    if(!keywords) {
        articleQuery = ArticleModel.find(query)
    } else {
        keywords = keywords.split(/\s+/)
        delete query.keywords
        articleQuery = ArticleModel.find(query).find({keywords: {$all: keywords}})
    }
    if(page) {
        articleQuery = articleQuery.where('page.name').equals(page.name)
    }
    if(tab) {
        articleQuery = articleQuery.where('tab.name').equals(tab.name)
    }
    if(type) {
        articleQuery = articleQuery.where('type.name').equals(type.name)
    }
    return articleQuery
}

export function update(id, data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    return ArticleModel.update({_id: id}, {$set: data})
}

export function create(data) {
    const date = new Date()
    data.timestamp = date.getTime()
    data.date = formatDate(date)
    const article = new ArticleModel(data);
    return article.save()
}

export function remove(id) {
    return ArticleModel.findByIdAndRemove(id)
}

function formatDate(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`
}