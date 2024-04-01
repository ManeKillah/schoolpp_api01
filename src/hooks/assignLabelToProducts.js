// const algolia = require("../utils/algolia");

const fromLabel = async (label_id, context) => {
	const labelsModel = context.app.service('labels').getModel()
	const labelsConditionsModel = context.app.service('labels-conditions').getModel()

	const [label, conditions] = await Promise.all([
		labelsModel.query()
			.where({ id: label_id, deletedAt: null })
			.then((it) => it.length ? it[0] : undefined),
		labelsConditionsModel.query()
			.where({ label_id, deletedAt: null })
	])

	if (!label || !conditions.length) return context;

	const knex = context.app.get('knex');

	// conditions
	const cPercentage = conditions.filter(it => it.type === 'discount_percentage')
	const cCategories = conditions.filter(it => it.type === 'categories')
	const cNewProducts = conditions.filter(it => it.type === 'new_product')
	const cProduct = conditions.filter(it => it.type === 'product')
	const cAllProducts = conditions.filter(it => it.type === 'all_products')

	const updateFieldsProduct = `
		UPDATE products
			SET label_id = ${label.id},
				label_name = '${label.name}',
				label_position = '${label.position}',
				label_start_date = '${new Date(label.date_start).toISOString()}',
				label_end_date = '${new Date(label.date_end).toISOString()}',
				label_path = '${label.path}'
	`

	if (cAllProducts.length) {
		await knex.raw(`
			${updateFieldsProduct}
			WHERE
				products.deletedAt IS NULL
				${cProduct.length ? `AND products.id NOT IN (${cProduct.map(it => it.product_id).join(',')})` : ''}
		`)

		const updatedIds = await knex.raw(`
			SELECT products.id FROM products WHERE products.deletedAt IS NULL ${cProduct.length ? `AND products.id NOT IN (${cProduct.map(it => it.product_id).join(',')})` : ''}
		`).then(res => res.length ? res[0].map(it => it.id) : [])

		if (!updatedIds.length) return context

		// const algoliaCredemtials = context.app.get("algolia");
		// const Algolia = new algolia(
		// 	'products',
		// 	algoliaCredemtials.appId,
		// 	algoliaCredemtials.apiKey
		// )

		const objects = updatedIds.map(id => ({
			id: id,
			// type: 'product',
			// real_id: id,
			label_id: label.id,
			label_name: label.name,
			label_position: label.position,
			label_start_date: new Date(label.date_start).toISOString(),
			label_end_date: new Date(label.date_end).toISOString(),
			label_path: label.path
		}))

		// Algolia.patchAll(objects
		context.app.service('meilisearch').patch(null, { index: 'search', records: objects })

		return context
	}

	const query = `
		SELECT * FROM (
			SELECT
				products.id,
				products.name,
				products.price,
				products.discount_price,
				products.price_with_tax,
				products.discount_price_whit_tax,
				datediff(now(), products.createdAt) AS days_of_created,
				products.label_id,
				labels.priority as label_priority,
				labels_conditions.type as label_type
			FROM products
				LEFT JOIN labels
					ON products.label_id = labels.id AND labels.deletedAt IS NULL
				LEFT JOIN labels_conditions
					ON labels_conditions.label_id = labels.id AND labels.deletedAt IS NULL
			WHERE
				products.deletedAt IS NULL
				${cProduct.length ? `AND products.id IN (${cProduct.map(it => it.product_id).join(',')})` : ''}
				${cPercentage.length ? `AND (
					IF(products.discount_price_whit_tax > 0 OR products.discount_price > 0,
						(IFNULL(products.price_with_tax, products.price) - IFNULL(products.discount_price_whit_tax, products.discount_price))
							* 100 div IFNULL(products.price_with_tax, products.price),
						0
							)
					) IN (${cPercentage.map(it => it.discount_percentage_is).join(',')})
				` : ''}
				${cCategories.length ? `AND products.category_id IN (${cCategories.map(it => it.category_id).join(',')})` : ''}
		) AS p
		WHERE
			p.label_type IS NULL OR p.label_type != 'product'
			AND p.label_priority < ${label.priority}
			${cNewProducts.length ? `AND (
				${cNewProducts.map(it => it.new_product_days).reduce((acc, it, index) => {
		if (index > 0) acc += 'OR '
		acc += `p.days_of_created <= ${it}`
		return acc
	}, '')}
			)` : ''}
	`

	let products = await knex.raw(query).then(res => res.length ? res[0] : [])

	// if (!cProduct.length) products = products.filter(it => it.label_priority < label.priority)
	if (!products.length) return context

	const productIds = products.map(it => it.id)

	await knex.raw(`
		${updateFieldsProduct}
		WHERE
			products.id IN (${productIds.join(',')})
	`)

	// const algoliaCredemtials = context.app.get("algolia");
	// const Algolia = new algolia(
	// 	'products',
	// 	algoliaCredemtials.appId,
	// 	algoliaCredemtials.apiKey
	// )

	const objects = productIds.map(id => ({
		id,
		// type: 'product',
		// real_id: id,
		label_id: label.id,
		label_name: label.name,
		label_position: label.position,
		label_start_date: new Date(label.date_start).toISOString(),
		label_end_date: new Date(label.date_end).toISOString(),
		label_path: label.path
	}))

	// Algolia.patchAll(objects)
	context.app.service('meilisearch').patch(null, { index: 'search', records: objects })

	return context
}

const updateProduct = async (id, dataLabel, knex) => {
	await knex.raw(`
		UPDATE products
			SET label_id = ${dataLabel.label_id || null},
				label_name = ${dataLabel.label_name ? `'${dataLabel.label_name}'` : null},
				label_position = ${dataLabel.label_position ? `'${dataLabel.label_position}'` : null},
				label_start_date = ${dataLabel.date_start ? `'${new Date(dataLabel.date_start).toISOString()}'` : null},
				label_end_date = ${dataLabel.date_end ? `'${new Date(dataLabel.date_end).toISOString()}'` : null},
				label_path = ${dataLabel.label_path ? `'${dataLabel.label_path}'` : null}
		WHERE products.id = ${id}
	`)
}

const isPriority = (priority, compare) => compare.filter(it => it > priority).length === 0

const fromProduct = async (product_id, context) => {
	const knex = context.app.get('knex')

	const product = await knex.raw(`
		SELECT
			products.id,
			products.category_id,
			datediff(now(), products.createdAt) AS days_of_created,
			(IF (products.discount_price_whit_tax > 0 OR products.discount_price > 0,
				(IFNULL(products.price_with_tax, products.price) - IFNULL(products.discount_price_whit_tax, products.discount_price))
					* 100 div IFNULL(products.price_with_tax, products.price), 0)) AS discount_percentage
		FROM products
		WHERE
			products.id = ${product_id}
			AND products.deletedAt IS NULL
	`).then(it => it[0][0])

	if (!product) return context

	const conditions = await knex.raw(`
		SELECT
			lc.id,
			lc.type,
			lc.discount_percentage_is,
			lc.category_id,
			lc.product_id,
			lc.new_product_days,
			lc.label_id,
			labels.name AS label_name,
			labels.path AS label_path,
			labels.priority AS label_priority,
			labels.position AS label_position,
			labels.date_start,
			labels.date_end
		FROM
			labels_conditions AS lc
			INNER JOIN labels ON labels.id = lc.label_id
			AND labels.deletedAt IS NULL
			AND labels.status = 'active'
		WHERE lc.deletedAt IS NULL
		ORDER BY labels.priority DESC
	`).then(it => it[0])

	if (!conditions.length) return context

	const cProduct = conditions.filter(it => it.type === 'product')
	const cPercentage = conditions.filter(it => it.type === 'discount_percentage')
	const cCategories = conditions.filter(it => it.type === 'categories')
	const cNewProducts = conditions.filter(it => it.type === 'new_product')
	const cAllProducts = conditions.filter(it => it.type === 'all_products')

	// Producto especifico
	if (cProduct.length) {
		const conditionData = cProduct.find(it => it.product_id === product_id)
		if (conditionData) {
			await updateProduct(product_id, conditionData, knex)
			return context
		}
	}

	if (cPercentage.length) {
		const conditionData = cPercentage.find(it => it.discount_percentage_is === product.discount_percentage)
		const priorities = [
			...cCategories.map(it => it.label_priority),
			...cNewProducts.map(it => it.label_priority),
			...cAllProducts.map(it => it.label_priority)
		]
		if (conditionData && isPriority(conditionData.label_priority, priorities)) {
			await updateProduct(product_id, conditionData, knex)
			return context
		}
	}

	if (cCategories.length) {
		const conditionData = cCategories.find(it => it.category_id === product.category_id)
		const priorities = [
			...cPercentage.map(it => it.label_priority),
			...cNewProducts.map(it => it.label_priority),
			...cAllProducts.map(it => it.label_priority)
		]
		if (conditionData && isPriority(conditionData.label_priority, priorities)) {
			console.log(1, 'entre', conditionData)
			await updateProduct(product_id, conditionData, knex)
			return context
		}
	}
	if (cNewProducts.length) {
		const priorities = [
			...cPercentage.map(it => it.label_priority),
			...cCategories.map(it => it.label_priority),
			...cAllProducts.map(it => it.label_priority)
		]
		const conditionData = cNewProducts.find(it => product.days_of_created <= it.new_product_days)
		if (conditionData && isPriority(conditionData.label_priority, priorities)) {
			await updateProduct(product_id, conditionData, knex)
			return context
		}
	}

	if (cAllProducts.length) {
		await updateProduct(product_id, cAllProducts[0], knex)
		return context
	}

	updateProduct(product_id, {}, knex)
	return context;
}

module.exports = (label_id, product_id) => async (context) => {
	if (label_id) return fromLabel(label_id, context)
	else if (product_id) return fromProduct(product_id, context)

	return context
}