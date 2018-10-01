const sdb = new ShouldDB();

sdb.create('users', { name: '', age: '', gender: 'M' })
sdb.create('posts', { title: '', link: '' })
sdb.insert('users', { name: 'Luiza1', age: 21, gender: 'F' })
sdb.insert('users', { name: 'Luiz2', age: 22 })
sdb.insert('users', { name: 'Luiz3', age: 23 })
sdb.insert('users', { name: 'Luiz4', age: 24, gender: 'F' })
sdb.insert('users', { name: 'Luiz5', age: 25 })
sdb.insert('users', { name: 'Luiz5', age: 25, gender: 'F' })
// console.log(sdb.getDB())