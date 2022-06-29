var json = [
// {"cmd":"USER_NONE"},
// {"cmd":"USER","id":"738ab419-01bd-404f-8527-ee85708e004c","server_id":0,"start_time":1645446904,"count":1},
// {"cmd":"USER_JOIN","count":2},
{"cmd":"USER_QUESTION","txt":"Dogs are better than cats!","time":30,"branch":[{"name":"Dogs are better than cats!","state":1,"answers":[]},{"name":"Root","state":1,"answers":[]}]},
{"cmd":"USER_PROMPT","txt":"Dogs are better than cats!","ans":0,"time":60},
{"cmd":"USER_QUESTION","txt":"Cats can take care of themselves!","time":30,"branch":[{"name":"Cats can take care of themselves!","state":1,"answers":[]},{"name":"Dogs are better than cats!","state":4,"answers":[{"val":1},{"val":1},{"val":0}]},{"name":"Root","state":4,"answers":[]}]},
{"cmd":"USER_QUESTION","txt":"Dogs are so friendly!","time":30,"branch":[{"name":"Dogs are so friendly!","state":1,"answers":[]},{"name":"Dogs are better than cats!","state":4,"answers":[{"val":1},{"val":1},{"val":0}]},{"name":"Root","state":4,"answers":[]}]},
{"cmd":"USER_PROMPT","txt":"Cats can take care of themselves!","ans":0,"time":60},
{"cmd":"USER_QUESTION","txt":"You still have to feed cats!","time":30,"branch":[{"name":"You still have to feed cats!","state":1,"answers":[]},{"name":"Cats can take care of themselves!","state":4,"answers":[{"val":0},{"val":0}, {"val": 0},{"val":1}]},{"name":"Dogs are better than cats!","state":4,"answers":[{"val":1},{"val":1},{"val":0}]},{"name":"Root","state":4,"answers":[]}]},
{"cmd":"USER_QUESTION","txt":"You can simply leave them for days while on holiday.","time":30,"branch":[{"name":"You can simply leave them for days while on holiday.","state":1,"answers":[]},{"name":"Cats can take care of themselves!","state":4,"answers":[{"val":0},{"val":0}, {"val": 0},{"val":1}]},{"name":"Dogs are better than cats!","state":4,"answers":[{"val":1},{"val":1},{"val":0}]},{"name":"Root","state":4,"answers":[]}]},
{"cmd":"USER_QUESTION","txt":"Cats can take care of themselves!","time":30,"branch":[{"name":"Cats can take care of themselves!","state":1,"answers":[]},{"name":"Dogs are better than cats!","state":4,"answers":[{"val":1},{"val":1},{"val":0}]},{"name":"Root","state":4,"answers":[]}]},
{"cmd":"USER_QUESTION","txt":"Dogs are better than cats!","time":30,"branch":[{"name":"Dogs are better than cats!","state":1,"answers":[]},{"name":"Root","state":4,"answers":[]}]},
{"cmd":"USER_DONE","data":["Dogs are so friendly!","You still have to feed cats!","You can simply leave them for days while on holiday.","Cats can take care of themselves!","Dogs are better than cats!"]},

]