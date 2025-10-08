/**
 * PocketBase Aggregation Hooks
 *
 * Automatically update aggregate fields when related records change.
 * Add this to PocketBase's pb_hooks directory.
 *
 * Hooks:
 * 1. Update template.rating_average when template_reviews are created/updated/deleted
 * 2. Update template.rating_count when template_reviews are created/deleted
 * 3. Update template.download_count when template_downloads are created
 * 4. Update category.template_count when templates are created/deleted
 */

// Update template rating statistics when reviews change
onRecordAfterCreateRequest((e) => {
	if (e.collection.name === 'template_reviews') {
		const review = e.record;
		const templateId = review.get('template');

		if (templateId) {
			updateTemplateRatingStats(templateId);
		}
	}
}, 'template_reviews');

onRecordAfterUpdateRequest((e) => {
	if (e.collection.name === 'template_reviews') {
		const review = e.record;
		const templateId = review.get('template');

		if (templateId) {
			updateTemplateRatingStats(templateId);
		}
	}
}, 'template_reviews');

onRecordAfterDeleteRequest((e) => {
	if (e.collection.name === 'template_reviews') {
		const review = e.record;
		const templateId = review.get('template');

		if (templateId) {
			updateTemplateRatingStats(templateId);
		}
	}
}, 'template_reviews');

// Update template download count when downloads are recorded
onRecordAfterCreateRequest((e) => {
	if (e.collection.name === 'template_downloads') {
		const download = e.record;
		const templateId = download.get('template');

		if (templateId) {
			// Increment download count
			try {
				const template = $app.dao().findRecordById('templates', templateId);
				const currentCount = template.get('download_count') || 0;
				template.set('download_count', currentCount + 1);
				$app.dao().saveRecord(template);
			} catch (error) {
				console.error('Failed to update download count:', error);
			}
		}
	}
}, 'template_downloads');

// Update category template count when templates are created/deleted
onRecordAfterCreateRequest((e) => {
	if (e.collection.name === 'templates') {
		const template = e.record;
		const categoryId = template.get('category');

		if (categoryId && template.get('is_published')) {
			incrementCategoryCount(categoryId);
		}
	}
}, 'templates');

onRecordAfterUpdateRequest((e) => {
	if (e.collection.name === 'templates') {
		const template = e.record;
		const oldCategoryId = e.record.originalCopy().get('category');
		const newCategoryId = template.get('category');
		const wasPublished = e.record.originalCopy().get('is_published');
		const isPublished = template.get('is_published');

		// Category changed
		if (oldCategoryId !== newCategoryId) {
			if (oldCategoryId && wasPublished) {
				decrementCategoryCount(oldCategoryId);
			}
			if (newCategoryId && isPublished) {
				incrementCategoryCount(newCategoryId);
			}
		}
		// Publish status changed
		else if (wasPublished !== isPublished) {
			if (isPublished && newCategoryId) {
				incrementCategoryCount(newCategoryId);
			} else if (!isPublished && newCategoryId) {
				decrementCategoryCount(newCategoryId);
			}
		}
	}
}, 'templates');

onRecordAfterDeleteRequest((e) => {
	if (e.collection.name === 'templates') {
		const template = e.record;
		const categoryId = template.get('category');

		if (categoryId && template.get('is_published')) {
			decrementCategoryCount(categoryId);
		}
	}
}, 'templates');

// Helper function to update template rating statistics
function updateTemplateRatingStats(templateId) {
	try {
		// Get all reviews for this template
		const reviews = $app.dao().findRecordsByExpr('template_reviews', $dbx.exp('template = {:templateId}', {
			templateId: templateId
		}));

		if (reviews.length === 0) {
			// No reviews - reset stats
			const template = $app.dao().findRecordById('templates', templateId);
			template.set('rating_average', 0);
			template.set('rating_count', 0);
			$app.dao().saveRecord(template);
			return;
		}

		// Calculate average rating
		let totalRating = 0;
		reviews.forEach((review) => {
			totalRating += review.get('rating') || 0;
		});

		const average = totalRating / reviews.length;

		// Update template record
		const template = $app.dao().findRecordById('templates', templateId);
		template.set('rating_average', Math.round(average * 10) / 10); // Round to 1 decimal
		template.set('rating_count', reviews.length);
		$app.dao().saveRecord(template);
	} catch (error) {
		console.error('Failed to update rating stats:', error);
	}
}

// Helper function to increment category template count
function incrementCategoryCount(categoryId) {
	try {
		const category = $app.dao().findRecordById('template_categories', categoryId);
		const currentCount = category.get('template_count') || 0;
		category.set('template_count', currentCount + 1);
		$app.dao().saveRecord(category);
	} catch (error) {
		console.error('Failed to increment category count:', error);
	}
}

// Helper function to decrement category template count
function decrementCategoryCount(categoryId) {
	try {
		const category = $app.dao().findRecordById('template_categories', categoryId);
		const currentCount = category.get('template_count') || 0;
		category.set('template_count', Math.max(0, currentCount - 1));
		$app.dao().saveRecord(category);
	} catch (error) {
		console.error('Failed to decrement category count:', error);
	}
}
